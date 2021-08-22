var express = require("express");
var router = express.Router();
var equipmentsRouter = require("./equipments");
var alarmsRouter = require("./alarms");

router.use("/equipments", equipmentsRouter);
router.use("/alarms", alarmsRouter);

module.exports = router;
