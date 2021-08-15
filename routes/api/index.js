var express = require("express");
var router = express.Router();
var equipmentRouter = require("./equipment");

router.use("/equipment", equipmentRouter);

module.exports = router;
