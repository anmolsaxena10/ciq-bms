const express = require("express");
const router = express.Router();
const models = require("../utils/models");
const loginAuthorizer = require('../utils/authMiddleware');
const { Validator } = require('node-input-validator');


/**
 * @swagger
 * components:
 *  schemas:
 *   Seat:
 *    type: object
 *    required:
 *     - price
 *     - row
 *     - number
 *     - theatreId
 *    properties:
 *     price:
 *      type: number
 *     theatreId:
 *      type: string
 *     row:
 *      type: string
 *     number:
 *      type: number
 */


/**
 * @swagger
 * /seat:
 *  get:
 *    description: Get all seats of a show
 *    parameters:
 *     - in: query
 *       name: showId
 *       schema:
 *        type: string
 *       required: false
 *     - in: query
 *       name: theatreId
 *       schema:
 *        type: string
 *       required: true
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 *  post:
 *    description: Add seats to a show
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Seat'
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 */

router.get("/", loginAuthorizer(false), async function (req, res) {
    // res.status(200).send([]);
    
    const v = new Validator(req.query, {
        theatreId: 'required'
	});
    
	const matched = await v.check();
    
	if(!matched){
        res.status(422).send(v.errors);
        return;
	}
    
    try{

        let theatreId = req.query.theatreId;
        let showId = req.query.showId;
        
        if(showId){
            let booked_seats = models.Booked_Seat.findAll({
                where: {
                    showId: showId
                },
                attributes: ["seatId"]
            });

            let seats = models.Seat.findAll({
                where: {
                    theatreId: theatreId
                }
            });

            Promise.all([booked_seats, seats])
            .then((result) => {
                let booked_seats = result[0];
                let seats = result[1];

                let booked_map = {};
                booked_seats.forEach(seat => {
                    booked_map[seat.seatId] = true;
                });

                let output = [];
                seats.forEach(seat => {
                    output.push({
                        id: seat.id,
                        price: seat.price,
                        row: seat.row,
                        number: seat.number,
                        theatreId: seat.theatreId,
                        is_booked: booked_map[seat.id] ? true : false
                    });
                });

                res.status(200).send(output);
                return;
            })
            .catch(error => {
                console.log(error);
                res.status(500).send(error.message);
                return;
            });
        }
        else{
            let seats = await models.Seat.findAll({
                where: {
                    theatreId: theatreId
                }
            });
            res.status(200).send(seats);
            return;
        }
    }
    catch(error){
        console.log(error);
        res.status(500).send(error.message);
    }
});

router.post("/", loginAuthorizer(true), async function(req, res){
    let payload = req.body;

	const v = new Validator({
        payload: payload
    },
    {
		payload: 'required|array',
        'payload.*.price': 'required|numeric',
        'payload.*.row': 'required|string',
        'payload.*.number': 'required|integer',
        'payload.*.theatreId': 'required|string'
	});

	const matched = await v.check();

	if(!matched){
		res.status(422).send(v.errors);
	}
	else{
		try{
            if(payload.length > 0){
                await models.Seat.bulkCreate(payload);
                res.status(200).send({"message": "successfully added"});
            }
            else{
                res.status(200).send({"message": "No seats provided"});
            }
		}
		catch(error){
			console.log(error);
			res.status(500).send(error.message);
        }
	}

});

module.exports = router;