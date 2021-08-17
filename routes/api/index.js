var express = require("express");
var router = express.Router();
var equipmentRouter = require("./equipment");
var alarmsRouter = require("./alarms");

router.use("/equipment", equipmentRouter);
router.use("/alarms", alarmsRouter);

module.exports = router;
