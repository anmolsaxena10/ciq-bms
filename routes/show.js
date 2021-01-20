const express = require("express");
const router = express.Router();
const models = require("../utils/models");
const loginAuthorizer = require('../utils/authMiddleware');
const { Validator } = require('node-input-validator');


/**
 * @swagger
 * components:
 *  schemas:
 *   Show:
 *    type: object
 *    required:
 *     - movieId
 *     - theatreId
 *     - startDatetime
 *    properties:
 *     movieId:
 *      type: string
 *     theatreId:
 *      type: string
 *     startDatetime:
 *      type: string
 *      format: date-time
 *      description: Show timing in string
 */


/**
 * @swagger
 * /show:
 *  get:
 *    description: Get all shows of a movie
 *    parameters:
 *     - in: query
 *       name: id
 *       schema:
 *        type: string
 *       required: false
 *     - in: query
 *       name: movieId
 *       schema:
 *        type: string
 *       required: false
 *     - in: query
 *       name: theatreId
 *       schema:
 *        type: string
 *       required: false
 *     - in: query
 *       name: cityId
 *       schema:
 *        type: string
 *       required: false
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 *  post:
 *    description: Add new show
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *          $ref: '#/components/schemas/Show'
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 */

router.get("/", loginAuthorizer(false), async function (req, res) {
	let showId = req.query.id;
    let movieId = req.query.movieId;
    let theatreId = req.query.theatreId;
    let cityId = req.query.cityId;

    console.log(typeof(showId), movieId, theatreId, cityId);

    if(showId){
        const show = await models.Show.findOne({
            where: {
                id: showId
            },
            attributes: ["id", "movieId", "theatreId", "startDatetime"]
        });
        res.status(200).send(show.toJSON());
    }
    else{
        if(theatreId){
            let clause = {
                where: {
                    theatreId: theatreId,
                },
                attributes: ["id", "movieId", "theatreId", "startDatetime"]
            }
            if(movieId) clause.where.movieId = movieId;
            let shows = await models.Show.findAll(clause);
            res.status(200).send(shows);
        }
        else if(cityId){
            let theatres = await models.Theatre.findAll({
                where: {
                    cityId: cityId
                },
                attributes: ["id"]
            });

            let theatreIds = [];
            theatres.forEach(t => theatreIds.push(t["id"]));

            let clause = {
                where: {
                    theatreId: theatreIds,
                },
                attributes: ["id", "movieId", "theatreId", "startDatetime"]
            }
            if(movieId) clause.where.movieId = movieId;
            let shows = await models.Show.findAll(clause);
            res.status(200).send(shows);
        }
        else if(movieId){
            let shows = await models.Show.findAll({
                where: {
                    movieId: movieId,
                },
                attributes: ["id", "movieId", "theatreId", "startDatetime"]
            });
            res.status(200).send(shows);
        }
        else{
            res.status(200).send([]);
        }
    }
});

router.post("/", loginAuthorizer(true), async function(req, res){
    let payload = req.body;
    
    payload.startDatetime = payload.startDatetime || "";
    payload.startDatetime = payload.startDatetime.replace("T", " ");
    payload.startDatetime = payload.startDatetime.split(".")[0];

	const v = new Validator(payload, {
		movieId: 'required',
        theatreId: 'required',
        startDatetime: 'required|datetime'
	});

	const matched = await v.check();

	if(!matched){
		res.status(422).send(v.errors);
	}
	else{
		try{
			if(payload.theatreId !== "*"){
                let show = await models.Show.create({
                    movieId: payload.movieId,
                    theatreId: payload.theatreId,
                    startDatetime: payload.startDatetime
                });
                
                res.status(200).send({
                    id: show.id,
                    movie: show.movieId,
                    theatreId: show.theatreId,
                    startDatetime: show.startDatetime
                });
            }
            else{
                let theatres = await models.Theatre.findAll({
                    attributes: ["id"]
                });

                let shows = [];

                theatres.forEach(t => {
                    shows.push({
                        movieId: payload.movieId,
                        theatreId: t.id,
                        startDatetime: payload.startDatetime
                    });
                });

                if(shows.length > 0)
                    await models.Show.bulkCreate(shows);
                res.status(200).send({"message": "successfully added"});
            }
		}
		catch(error){
			console.log(error);
			res.status(500).send(error.message);
		}
	}

});

module.exports = router;