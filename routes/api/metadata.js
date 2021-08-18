var express = require("express");
var router = express.Router();
var pool = require("../../module/db");

/* GET /api/metadata/alarms */
router.get("/alarms", async (req, res, next) => {
    const SQL = `
        SELECT EVENT_NAME AS name, count(*) as COUNT
        FROM
            events
        WHERE
            EVENT_TYPE = 'Alarm'
                AND RESERVED_1 IN (2 , 3)
        GROUP BY EVENT_NAME;
    `;
    const [rows, fields] = await pool.query(SQL);
    res.json(rows);
});

module.exports = router;
