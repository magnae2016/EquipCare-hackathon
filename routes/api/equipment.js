var express = require("express");
var router = express.Router();
var moment = require("moment");
var pool = require("../../module/db");

/* GET /api/equipment/mtbi */
router.get("/mtbi", async (req, res, next) => {
    const { limit = 10, offset = 0 } = req.query;
    const SQL = `
        SELECT 
            ID,
            START_TIME,
            MTBI.EQ_NAME,
            ALARM_COUNT,
            MTBI_VALUE,
            EQ_TESTER
        FROM
            MTBI
                JOIN
            equipments ON MTBI.EQ_NAME = equipments.EQ_NAME
        ORDER BY ID DESC
        LIMIT ${limit} OFFSET ${offset};
    `;
    const [rows, fields] = await pool.query(SQL);
    res.json(rows);
});

/* GET /api/equipment/alarms */
/* GET /api/equipment/alarms/error */
/* GET /api/equipment/alarms/down */
router.get(["/alarms", "/alarms/:filter"], async (req, res, next) => {
    // var day = moment().format("YYYY-MM-DD");
    var day = "2021-07-01"; // TODO: revert today
    const { startDate = day, endDate = startDate } = req.query;
    const response = {};
    const { filter } = req.params;
    const RESERVED_1 = {
        error: 2,
        down: 3,
    };
    const CODE = RESERVED_1[filter];
    let JOIN_SQL = "";
    let WHERE_SQL = "";
    if (filter) {
        JOIN_SQL = `
            LEFT JOIN
        events AS B ON A.RESERVED_1 = B.EVENT_CODE
            AND A.EQ_MODEL = B.EQ_MODEL
        `;
        WHERE_SQL = `
            AND B.RESERVED_1 = ${CODE}
        `;
    }

    const SQL1 = `
        SELECT 
            EQ_NAME, COUNT(*) AS COUNT
        FROM
            ALARM AS A
            ${JOIN_SQL}
        WHERE
            DATE_FORMAT(A.START_TIME, '%Y-%m-%d') between '${startDate}' and '${endDate}'
            ${WHERE_SQL}
        GROUP BY A.EQ_NAME
        ORDER BY COUNT DESC;
    `;
    const SQL2 = `
        SELECT 
            COUNT(*) AS COUNT
        FROM
            ALARM AS A
            ${JOIN_SQL}
        WHERE
            DATE_FORMAT(START_TIME, '%Y-%m-%d') between '${startDate}' and '${endDate}'
            ${WHERE_SQL};
    `;
    const SQL3 = `
        SELECT 
            *
        FROM
            ark_events.last_update_time;
    `;

    const [result1, result2, result3] = await Promise.all([
        pool.query(SQL1),
        pool.query(SQL2),
        pool.query(SQL3),
    ]);

    let [rows] = result3;
    response.last_update_time = rows[0].update_time;
    [rows] = result2;
    response.count = rows[0].COUNT;
    [rows] = result1;
    response.datas = rows;

    res.json(response);
});

module.exports = router;
