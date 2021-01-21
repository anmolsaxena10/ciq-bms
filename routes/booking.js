const express = require("express");
const router = express.Router();
const models = require("../utils/models");
const loginAuthorizer = require('../utils/authMiddleware');
const { Validator } = require('node-input-validator');


/**
 * @swagger
 * components:
 *  schemas:
 *   Booking:
 *    type: object
 *    required:
 *     - showId
 *    properties:
 *     userId:
 *      type: string
 *     showId:
 *      type: string
 */


/**
 * @swagger
 * /booking/{id}:
 *  get:
 *    description: Get booking details
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *        type: string
 *       required: true
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 * /booking:
 *  post:
 *    description: Book tickets for a show
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *          type: object
 *          properties:
 *           showId:
 *             type: string
 *           seatIds:
 *             type: array
 *             items:
 *               type: string
 *    responses:
 *      '200':
 *        description: Successful
 *    security:
 *       - basicAuth: []
 */

router.get("/", loginAuthorizer(false), async function (req, res) {
    // res.status(200).send([]);
    
    const v = new Validator(req.params, {
        id: 'required'
	});
    
	const matched = await v.check();
    
	if(!matched){
        res.status(422).send(v.errors);
        return;
	}
    
    try{
        let bookingId = req.params.id;
        let booking = await models.Booking.findOne({
			where: {
				id: bookingId
			}
		});
		let seats = booking.getBooked_Seats();
		let show = booking.getShow();
		Promise.all([seats, show])
		.then(async result => {
			let booked_seats = result[0];
			let show = result[1];

			let seatIds = [];
			booked_seats.forEach(seat => {
				seatIds.push(seat.id);
			});

			let seats = await models.Seat.findAll({
				where: {
					id: seatIds
				}
			});

			let response = booking.toJSON();
			response["seats"] = seats;
			response["show"] = show.toJSON();

			res.status(200).send(response);
		})
		.catch(error => {
			console.log(error);
			res.status(500).send(error.message);
			return;
		});
    }
    catch(error){
        console.log(error);
        res.status(500).send(error.message);
    }
});

router.post("/", loginAuthorizer(false), async function(req, res){
    let payload = req.body;

	const v = new Validator(payload,
    {
		'showId': 'required',
		'seatIds': 'required|array'
	});

	const matched = await v.check();

	if(!matched){
		res.status(422).send(v.errors);
	}
	else{
		try{
			let showId = payload.showId;
			let seatIds = payload.seatIds;
			let userId = payload.userId;
			if(!userId){
				userId = (await models.User.findOne({
					where: {
						email: req.auth.user
					}
				})).id;
			}

			const booking = await models.sequelize.transaction(async (t) => {
				let booking = await models.Booking.create({
					showId: showId,
					userId: userId
				}, { transaction: t });

				let seats_to_book = [];
				seatIds.forEach(id => {
					seats_to_book.push({
						seatId: id,
						showId: showId,
						bookingId: booking.id
					});
				});

				let booked_seats = await models.Booked_Seat.bulkCreate(
					seats_to_book,
					{ transaction: t }
				);

				let amount = await models.Seat.sum('price',{
					where: {
						id: seatIds
					}
				}, { transaction: t });

				await booking.update({
					amount: amount
				}, { transaction: t });

				let response = booking.toJSON();
				response.seats = booked_seats;
				return response;
			});

			res.status(200).send(booking);

		}
		catch(error){
			console.log(error);
			res.status(500).send(error.message);
        }
	}

});

module.exports = router;