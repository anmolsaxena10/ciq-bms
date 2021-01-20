const express = require("express");
const router = express.Router();
const loginAuthorizer = require('../utils/authMiddleware');
const models = require("../utils/models");


/**
 * @swagger
 * components:
 *  schemas:
 *   City:
 *    type: object
 *    required:
 *     - name
 *    properties:
 *     name:
 *      type: string
 */


 /**
 * @swagger
 * /city:
 *  get:
 *    description: Get all cities
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 */

router.get("/", loginAuthorizer(false), async function (req, res) {
	const cities = await models.City.findAll({
		attributes: ['name', 'id']
	});
	res.status(200).json(cities);
});

module.exports = router;