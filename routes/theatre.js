const express = require("express");
const router = express.Router();
const models = require("../utils/models");
const loginAuthorizer = require('../utils/authMiddleware');
const { Validator } = require('node-input-validator');


/**
 * @swagger
 * components:
 *  schemas:
 *   Theatre:
 *    type: object
 *    required:
 *     - name
 *     - city
 *    properties:
 *     name:
 *      type: string
 *     city:
 *      type: string
 */


 /**
 * @swagger
 * /theatre/{cityId}:
 *  get:
 *    description: Get all theatre
 *    parameters:
 *     - in: path
 *       name: cityId
 *       schema:
 *        type: string
 *       required: true
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 * /theatre:
 *  post:
 *    description: Add new theatre
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *          $ref: '#/components/schemas/Theatre'
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 */

router.get("/:cityId", loginAuthorizer(false), async function (req, res) {
	let cityId = (req.params.cityId || "").toLowerCase();

	try{
		const city = await models.City.findOne({
			where: {
				id: cityId
			}
		});
		
		let theatres = [];
		
		if(city){
			theatres = await city.getTheatres();
		}
		
		res.status(200).json(theatres);
	}
	catch(error){
		console.log(error);
		res.status(500).send(error.message);
	}
});

router.post("/", loginAuthorizer(true), async function(req, res){
	let payload = req.body;

	const v = new Validator(payload, {
		name: 'required',
		city: 'required',
	});

	const matched = await v.check();

	if(!matched){
		res.status(422).send(v.errors);
	}
	else{
		try{
			payload.city = payload.city.toLowerCase();
			payload.name = payload.name.toLowerCase();

			let city = await models.City.findOne({
				where:{
					name: payload.city
				}
			});
			if(!city){
				city = await models.City.create({
					name: payload.city
				});
			}

			const theatre = await city.createTheatre({
				name: payload.name
			});

			res.status(200).send({
				id: theatre.id,
				name: theatre.name,
				city: city.name,
				cityId: city.id
			});
		}
		catch(error){
			console.log(error);
			res.status(500).send(error.message);
		}
	}

});

module.exports = router;