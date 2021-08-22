var express = require("express");
var router = express.Router();
var moment = require("moment");
var pool = require("../../module/db");

/* GET /api/alarms?aggregation={day} */
/* GET /api/alarms/error?aggregation={day} */
/* GET /api/alarms/down?aggregation={day} */
router.get(["/", "/:filter"], async (req, res, next) => {
    // var day = moment().format("YYYY-MM-DD");
    var day = "2021-07-01"; // TODO: revert today
    var subtract = moment(day).subtract(1, "months").format("YYYY-MM-DD");
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

    const SQL = `
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
    const [rows, fields] = await pool.query(SQL);
    res.json(rows);
});

/* GET /api/alarms/:name/equipments */
router.get("/:name/equipments", async (req, res, next) => {
    // var day = moment().format("YYYY-MM-DD");
    var day = "2021-07-01"; // TODO: revert today
    const { startDate = day, endDate = startDate } = req.query;
    const response = {};
    const { name: EVENT_NAME } = req.params;

    const SQL1 = `
        SELECT 
        A.EQ_NAME, C.EQ_TESTER, COUNT(A.EQ_NAME) AS COUNT
        FROM
            ALARM AS A
                LEFT JOIN
            events AS B ON A.RESERVED_1 = B.EVENT_CODE
                AND A.EQ_MODEL = B.EQ_MODEL
                LEFT JOIN
            equipments AS C ON A.EQ_NAME = C.EQ_NAME
        WHERE
            DATE_FORMAT(A.START_TIME, '%Y-%m-%d') between '${startDate}' and '${endDate}'
                AND B.EVENT_NAME = '${EVENT_NAME}'
        GROUP BY A.EQ_NAME
        ORDER BY COUNT DESC;
    `;

    const SQL2 = `
        SELECT 
            COUNT(1) as COUNT
        FROM
            ALARM AS A
                LEFT JOIN
            events AS B ON A.RESERVED_1 = B.EVENT_CODE
                AND A.EQ_MODEL = B.EQ_MODEL
        WHERE
            DATE_FORMAT(A.START_TIME, '%Y-%m-%d') between '${startDate}' and '${endDate}'
                AND B.EVENT_NAME = '${EVENT_NAME}'
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
