var express = require("express");
var router = express.Router();
var moment = require("moment");
var pool = require("../../../module/db");

/* GET /api/v1/alarms/:filter/order */
router.get("/:filter/order", async (req, res, next) => {
    var day = moment().format("YYYY-MM-DD");

    const { startDate = day } = req.query;
    const { filter } = req.params;
    const RESERVED_1 = {
        error: 2,
        down: 3,
    };
    const CODE = RESERVED_1[filter];
    const SQL = `
        SELECT 
            B.EVENT_NAME, count(*) as COUNT
        FROM
            ALARM AS A
                LEFT JOIN
            events AS B ON A.RESERVED_1 = B.EVENT_CODE
                AND A.EQ_MODEL = B.EQ_MODEL
        WHERE
            LEFT(A.START_TIME, 10) = '${startDate}'
            AND B.RESERVED_1 = ${CODE}
        GROUP BY B.EVENT_NAME
        ORDER BY COUNT desc;
    `;

    const [rows, fields] = await pool.query(SQL);
    res.json(rows);
});

/* GET /api/v1/alarms/:filter/consumed */
router.get("/:filter/consumed", async (req, res, next) => {
    var day = moment().format("YYYY-MM-DD");

    const { startDate = day } = req.query;
    const { filter } = req.params;
    const RESERVED_1 = {
        error: 2,
        down: 3,
    };
    const CODE = RESERVED_1[filter];
    const SQL = `
        SELECT 
            sum(time_to_sec(A.END_TIME) - time_to_sec(A.START_TIME)) as CONSUMED, count(A.START_TIME) as COUNT
        FROM
            ALARM AS A
                LEFT JOIN
            events AS B ON A.RESERVED_1 = B.EVENT_CODE
                AND A.EQ_MODEL = B.EQ_MODEL
        WHERE
            LEFT(A.START_TIME, 10) = '${startDate}'
            AND B.RESERVED_1 = ${CODE};
    `;

    const [rows, fields] = await pool.query(SQL);
    res.json(rows);
});

/* GET /api/v1/alarms/increment */
router.get(["/increment", "/increment/:filter"], async (req, res, next) => {
    var day = moment().format("YYYY-MM-DD");
    
    const response = {};
    const { startDate = day } = req.query;
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

    const SQL = `
        select *, dd.count - ifnull(LAG(dd.count) over (order by dd.Hour), 0) as diff
        from (SELECT 
            totalhours.Hour, COUNT(*) AS COUNT
        FROM
            ALARM as A
                RIGHT outer JOIN
            (SELECT '00:10' AS Hour UNION ALL SELECT '00:20' UNION ALL SELECT '00:30' UNION ALL SELECT '00:40' UNION ALL SELECT '00:50' UNION ALL SELECT '01:00' UNION ALL SELECT '01:10' UNION ALL SELECT '01:20' UNION ALL SELECT '01:30' UNION ALL SELECT '01:40' UNION ALL SELECT '01:50' UNION ALL SELECT '02:00' UNION ALL SELECT '02:10' UNION ALL SELECT '02:20' UNION ALL SELECT '02:30' UNION ALL SELECT '02:40' UNION ALL SELECT '02:50' UNION ALL SELECT '03:00' UNION ALL SELECT '03:10' UNION ALL SELECT '03:20' UNION ALL SELECT '03:30' UNION ALL SELECT '03:40' UNION ALL SELECT '03:50' UNION ALL SELECT '04:00' UNION ALL SELECT '04:10' UNION ALL SELECT '04:20' UNION ALL SELECT '04:30' UNION ALL SELECT '04:40' UNION ALL SELECT '04:50' UNION ALL SELECT '05:00' UNION ALL SELECT '05:10' UNION ALL SELECT '05:20' UNION ALL SELECT '05:30' UNION ALL SELECT '05:40' UNION ALL SELECT '05:50' UNION ALL SELECT '06:00' UNION ALL SELECT '06:10' UNION ALL SELECT '06:20' UNION ALL SELECT '06:30' UNION ALL SELECT '06:40' UNION ALL SELECT '06:50' UNION ALL SELECT '07:00' UNION ALL SELECT '07:10' UNION ALL SELECT '07:20' UNION ALL SELECT '07:30' UNION ALL SELECT '07:40' UNION ALL SELECT '07:50' UNION ALL SELECT '08:00' UNION ALL SELECT '08:10' UNION ALL SELECT '08:20' UNION ALL SELECT '08:30' UNION ALL SELECT '08:40' UNION ALL SELECT '08:50' UNION ALL SELECT '09:00' UNION ALL SELECT '09:10' UNION ALL SELECT '09:20' UNION ALL SELECT '09:30' UNION ALL SELECT '09:40' UNION ALL SELECT '09:50' UNION ALL SELECT '10:00' UNION ALL SELECT '10:10' UNION ALL SELECT '10:20' UNION ALL SELECT '10:30' UNION ALL SELECT '10:40' UNION ALL SELECT '10:50' UNION ALL SELECT '11:00' UNION ALL SELECT '11:10' UNION ALL SELECT '11:20' UNION ALL SELECT '11:30' UNION ALL SELECT '11:40' UNION ALL SELECT '11:50' UNION ALL SELECT '12:00' UNION ALL SELECT '12:10' UNION ALL SELECT '12:20' UNION ALL SELECT '12:30' UNION ALL SELECT '12:40' UNION ALL SELECT '12:50' UNION ALL SELECT '13:00' UNION ALL SELECT '13:10' UNION ALL SELECT '13:20' UNION ALL SELECT '13:30' UNION ALL SELECT '13:40' UNION ALL SELECT '13:50' UNION ALL SELECT '14:00' UNION ALL SELECT '14:10' UNION ALL SELECT '14:20' UNION ALL SELECT '14:30' UNION ALL SELECT '14:40' UNION ALL SELECT '14:50' UNION ALL SELECT '15:00' UNION ALL SELECT '15:10' UNION ALL SELECT '15:20' UNION ALL SELECT '15:30' UNION ALL SELECT '15:40' UNION ALL SELECT '15:50' UNION ALL SELECT '16:00' UNION ALL SELECT '16:10' UNION ALL SELECT '16:20' UNION ALL SELECT '16:30' UNION ALL SELECT '16:40' UNION ALL SELECT '16:50' UNION ALL SELECT '17:00' UNION ALL SELECT '17:10' UNION ALL SELECT '17:20' UNION ALL SELECT '17:30' UNION ALL SELECT '17:40' UNION ALL SELECT '17:50' UNION ALL SELECT '18:00' UNION ALL SELECT '18:10' UNION ALL SELECT '18:20' UNION ALL SELECT '18:30' UNION ALL SELECT '18:40' UNION ALL SELECT '18:50' UNION ALL SELECT '19:00' UNION ALL SELECT '19:10' UNION ALL SELECT '19:20' UNION ALL SELECT '19:30' UNION ALL SELECT '19:40' UNION ALL SELECT '19:50' UNION ALL SELECT '20:00' UNION ALL SELECT '20:10' UNION ALL SELECT '20:20' UNION ALL SELECT '20:30' UNION ALL SELECT '20:40' UNION ALL SELECT '20:50' UNION ALL SELECT '21:00' UNION ALL SELECT '21:10' UNION ALL SELECT '21:20' UNION ALL SELECT '21:30' UNION ALL SELECT '21:40' UNION ALL SELECT '21:50' UNION ALL SELECT '22:00' UNION ALL SELECT '22:10' UNION ALL SELECT '22:20' UNION ALL SELECT '22:30' UNION ALL SELECT '22:40' UNION ALL SELECT '22:50' UNION ALL SELECT '23:00' UNION ALL SELECT '23:10' UNION ALL SELECT '23:20' UNION ALL SELECT '23:30' UNION ALL SELECT '23:40' UNION ALL SELECT '23:50' UNION ALL SELECT '24:00') AS totalhours 
            ON SUBSTRING(START_TIME, 12, 5) < totalhours.Hour
            ${JOIN_SQL}
        WHERE
            LEFT(START_TIME, 10) = '${startDate}'
            ${WHERE_SQL}
        GROUP BY totalhours.Hour
        order by Hour) dd;
    `;

    const [rows, fields] = await pool.query(SQL);
    res.json(rows);
});

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
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kr_curr = new Date(rows[0].update_time + KR_TIME_DIFF);

    response.last_update_time = moment(kr_curr).format("YYYY-MM-DD HH:mm:ss");
    [rows] = result1;
    response.datas = rows;

    res.json(response);
});

/* GET /api/v1/alarms/increment */
router.get("/increment", async (req, res, next) => {});

module.exports = router;
