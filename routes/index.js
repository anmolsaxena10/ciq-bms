const userRouter = require('./user');
const movieRouter = require('./movie');
const theatreRouter = require('./theatre');
const bookingRouter = require('./booking');
const showRouter = require('./show');
const cityRouter = require('./city');

const express = require("express");
const router = express.Router();

router.use("/user", userRouter);
router.use("/movie", movieRouter);
router.use("/theatre", theatreRouter);
router.use("/booking", bookingRouter);
router.use("/show", showRouter);
router.use("/city", cityRouter);

module.exports = router;