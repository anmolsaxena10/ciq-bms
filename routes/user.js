const express = require("express");
const router = express.Router();
const loginAuthorizer = require('../utils/authMiddleware');
const models = require("../utils/models");
const bcrypt = require('bcrypt');
const { Validator } = require('node-input-validator');


/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *     - name
 *     - password
 *     - email
 *    properties:
 *     name:
 *      type: string
 *     password:
 *      type: string
 *     email:
 *      type: string
 *      format: email
 *     is_admin:
 *      type: boolean
 */


 /**
 * @swagger
 * /user:
 *  get:
 *    description: Get all users
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 *  post:
 *    description: Add new user
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *          $ref: '#/components/schemas/User'
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 */

router.get("/", loginAuthorizer(true), async function (req, res) {
	const users = await models.User.findAll({
		attributes: ['name', 'email', 'is_admin']
	});
	res.status(200).json(users);
});


router.post("/", loginAuthorizer(true), async function(req, res){
	let payload = req.body;

	const v = new Validator(payload, {
		name: 'required',
		email: 'required|email',
		password: 'required'
	});

	const matched = await v.check();

	if(!matched){
		res.status(422).send(v.errors);
	}
	else{
		try{
			const saltRounds = 10;
			let pass_hash = await bcrypt.hash(payload.password, saltRounds);
			let is_admin = payload.is_admin || false;


			const user = await models.User.create({
				name: payload.name,
				email: payload.email,
				is_admin:  is_admin,
				pass_hash: pass_hash
			});

			res.status(200).send({
				name: user.name,
				email: user.email,
				is_admin: user.is_admin
			});
		}
		catch(error){
			res.status(500).send(error.message);
		}
	}
})

module.exports = router;