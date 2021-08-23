var express = require("express");
var router = express.Router();
var moment = require("moment");
var pool = require("../../../module/db");

const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

/* GET /api/v1/equipments/alarms */
/* GET /api/v1/equipments/alarms/error */
/* GET /api/v1/equipments/alarms/down */
router.get(["/alarms", "/alarms/:filter"], async (req, res, next) => {
    var day = moment().format("YYYY-MM-DD");
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
            last_update_time;
    `;

    const [result1, result2, result3] = await Promise.all([
        pool.query(SQL1),
        pool.query(SQL2),
        pool.query(SQL3),
    ]);

    let [rows] = result3;
    const kr_curr = new Date(rows[0].update_time + KR_TIME_DIFF);

    response.last_update_time = moment(kr_curr).format("YYYY-MM-DD HH:mm:ss");
    [rows] = result2;
    response.count = rows[0].COUNT;
    [rows] = result1;
    response.datas = rows;

    res.json(response);
});

/* GET /api/v1/equipments/status */
router.get("/status", async (req, res, next) => {
    var day = moment().format("YYYY-MM-DD");
    const SQL = `
        SELECT 
            A.eq_name, A.e_type, A.e_time
        FROM
            (SELECT 
                equipments.eq_name AS eq_name,
                    equipments.eq_operating_state AS e_code,
                    equipments.eq_last_operating_time AS e_time,
                    IFNULL(events.reserved_1, 1) AS e_type
            FROM
                equipments
            LEFT JOIN events ON equipments.eq_model = events.eq_model
                AND equipments.eq_operating_state = events.event_code) AS A
        ORDER BY A.eq_name;
    `;

    const [rows, fields] = await pool.query(SQL);
    const response = rows.map((element) => {
        const kr_curr = new Date(element.e_time + KR_TIME_DIFF);
        return {
            ...element,
            e_time: moment(kr_curr).format("YYYY-MM-DD HH:mm:ss"),
        };
    });
    res.json(response);
});

module.exports = router;
