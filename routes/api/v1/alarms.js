var express = require("express");
var router = express.Router();
var moment = require("moment");
var pool = require("../../../module/db");

/* GET /api/v1/alarms?aggregation={day} */
/* GET /api/v1/alarms/error?aggregation={day} */
/* GET /api/v1/alarms/down?aggregation={day} */
router.get(["/", "/:filter"], async (req, res, next) => {
    var day = moment().format("YYYY-MM-DD");
    var subtract = moment(day).subtract(1, "months").format("YYYY-MM-DD");
    const response = {};
    const {
        aggregation = "day",
        endDate = day,
        startDate = subtract,
    } = req.query;
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

    let GROUP_CONDITION = "";
    let GROUP_ALIAS = "";
    if (aggregation === "day") {
        GROUP_CONDITION = `LEFT(A.START_TIME, 10)`;
        GROUP_ALIAS = "DATE";
    }

    const SQL1 = `
        SELECT 
            ${GROUP_CONDITION} as ${GROUP_ALIAS}, COUNT(*) as COUNT
        FROM
            ALARM as A
            ${JOIN_SQL}
        WHERE
            DATE_FORMAT(A.START_TIME, '%Y-%m-%d') between '${startDate}' and '${endDate}'
            ${WHERE_SQL}
        GROUP BY ${GROUP_CONDITION};
    `;

    const SQL2 = `
        SELECT 
            *
        FROM
            last_update_time;
    `;

    const [result1, result2] = await Promise.all([
        pool.query(SQL1),
        pool.query(SQL2),
    ]);

    let [rows] = result2;
    response.last_update_time = rows[0].update_time;
    [rows] = result1;
    response.datas = rows;

    res.json(response);
});

/* GET /api/v1/alarms/increment */
router.get("/increment", async (req, res, next) => {});

module.exports = router;
