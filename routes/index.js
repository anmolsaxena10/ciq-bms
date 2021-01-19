const userRouter = require('./user');
const movieRouter = require('./movie');
const theatreRouter = require('./theatre');
const bookingRouter = require('./booking');

const express = require("express");
const router = express.Router();

router.use("/user", userRouter);
router.use("/movie", movieRouter);
router.use("/theatre", theatreRouter);
router.use("/booking", bookingRouter);

module.exports = router;