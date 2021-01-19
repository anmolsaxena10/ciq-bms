const express = require("express");
const router = express.Router();
const models = require("../utils/models");
const loginAuthorizer = require('../utils/authMiddleware');
const { Validator } = require('node-input-validator');


/**
 * @swagger
 * components:
 *  schemas:
 *   Movie:
 *    type: object
 *    required:
 *     - name
 *    properties:
 *     name:
 *      type: string
 *     releaseDate:
 *      type: string
 *      format: date
 *     description:
 *      type: string
 */


 /**
 * @swagger
 * /movie:
 *  get:
 *    description: Get all movies
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 *  post:
 *    description: Add new movie
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *          $ref: '#/components/schemas/Movie'
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 */

router.get("/", loginAuthorizer(false), async function (req, res) {
	const movies = await models.Movie.findAll({
		attributes: ['name', 'releaseDate', 'description']
	});
	res.status(200).json(movies);
});

router.post("/", loginAuthorizer(true), async function(req, res){
	let payload = req.body;

	const v = new Validator(payload, {
		name: 'required',
		releaseDate: 'date',
	});

	const matched = await v.check();

	if(!matched){
		res.status(422).send(v.errors);
	}
	else{
		try{
			const movie = await models.Movie.create({
				name: payload.name,
				releaseDate: payload.releaseDate,
				description: payload.description
			});

			res.status(200).send({
				name: movie.name,
				releaseDate: movie.releaseDate,
				description: movie.description
			});
		}
		catch(error){
			res.status(500).send(error.message);
		}
	}

});

module.exports = router;