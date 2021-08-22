var express = require("express");
var router = express.Router();
var equipmentRouter = require("./equipment");
var alarmsRouter = require("./alarms");
var metadataRouter = require("./metadata");
var v1Router = require("./v1");

router.use("/equipment", equipmentRouter);
router.use("/alarms", alarmsRouter);
router.use("/metadata", metadataRouter);
router.use("/v1", v1Router);

module.exports = router;
