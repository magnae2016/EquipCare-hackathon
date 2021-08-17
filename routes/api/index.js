var express = require("express");
var router = express.Router();
var equipmentRouter = require("./equipment");
var alarmsRouter = require("./alarms");
var metadataRouter = require("./metadata");

router.use("/equipment", equipmentRouter);
router.use("/alarms", alarmsRouter);
router.use("/metadata", metadataRouter);

module.exports = router;
