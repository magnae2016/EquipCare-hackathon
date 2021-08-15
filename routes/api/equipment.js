var express = require("express");
var router = express.Router();
var pool = require("../../module/db");

/* GET /api/equipment/mtbi */
router.get("/mtbi", async (req, res, next) => {
    const { limit = 10, offset = 0 } = req.query;
    const SQL = `
        SELECT ID, START_TIME, MTBI.EQ_NAME, ALARM_COUNT, MTBI_VALUE, EQ_TESTER
        FROM MTBI JOIN equipments
        on MTBI.EQ_NAME = equipments.EQ_NAME 
        order by ID desc
        limit ${limit} offset ${offset};
    `;
    const [rows, fields] = await pool.query(SQL);
    res.json(rows);
});

module.exports = router;
