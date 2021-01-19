const express = require("express");
const router = express.Router();
const loginAuthorizer = require('../utils/authMiddleware');

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
 */

router.get("/", loginAuthorizer(true),  function (req, res) {
	res.status(200).json({"message":"hello user"});
});


// Password hashing syntax
// bcrypt.hash(myPlaintextPassword, saltRounds).then(function(hash) {
//     // Store hash in your password DB.
// });


module.exports = router;