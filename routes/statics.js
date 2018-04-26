var express = require('express');
var router = express.Router();
var conn = require('../util/dbconnection');
var DateUtil = require('../util/DateUtil');

/* GET statics listing. */
router.get('/:brand', function(req, res, next) {
	var response = [];
	
	var brand = req.params.brand;
	var current = DateUtil.lastday();
	var previous = DateUtil.lastdayinlastyear();
	
	var date = new Date();
	var dayOfMonth = date.getDate();
	date.setDate(dayOfMonth - 1);
	
	var firstDayThisYear = DateUtil.firstDayYear(date);
	
	var year = date.getFullYear();
	date.setFullYear(year - 1);
	var firstDayLastYear = DateUtil.firstDayYear(date);
	
	var thisYear = firstDayThisYear.substr(0,4);
	var lastYear = firstDayLastYear.substr(0,4);
	
	console.log(firstDayThisYear, firstDayLastYear, thisYear, lastYear);
	conn.query("select month, " +
					"SUM(case when year = " + lastYear + " then sale end) as 'lastSale', " +
					"SUM(case when year = " + thisYear + " then sale end) as 'currentSale', " +
					"SUM(case when year = " + lastYear + " then cancel end) as 'lastCancel', " + 
                    "SUM(case when year = " + thisYear + " then cancel end) as 'currentCancel', " + 
				    "SUM(case when year = " + lastYear + " then totalvisit end) as 'lastTotalvisit', " +
					"SUM(case when year = " + thisYear + " then totalvisit end) as 'currentTotalvisit', " +
				    "SUM(case when year = " + lastYear + " then firstvisit end) as 'lastFirstvisit', " +
					"SUM(case when year = " + thisYear + " then firstvisit end) as 'currentFirstvisit', " +
				    "SUM(case when year = " + lastYear + " then revisit end) as 'lastRevisit', " +
					"SUM(case when year = " + thisYear + " then revisit end) as 'currentRevisit', " +
				    "SUM(case when year = " + lastYear + " then newmember end) as 'lastNewmember', " +
					"SUM(case when year = " + thisYear + " then newmember end) as 'currentNewmember', " +
				    "SUM(case when year = " + lastYear + " then pv end) as 'lastPv', " +
					"SUM(case when year = " + thisYear + " then pv end) as 'currentPv', " +
				    "ROUND(AVG(case when year = " + lastYear + " then perman end)) as 'lastPerman', " +
					"ROUND(AVG(case when year = " + thisYear + " then perman end)) as 'currentPerman', " +
				    "ROUND(AVG(case when year = " + lastYear + " then buyer end),2) as 'lastBuyer', " +
					"ROUND(AVG(case when year = " + thisYear + " then buyer end),2) as 'currentBuyer' " +
				"FROM (select date_format(date, '%m') month, date_format(date, '%Y') as year, sale, cancel, totalvisit, firstvisit, revisit, newmember,pv, perman, buyer " +
				"FROM statics where date between '" + firstDayThisYear + "' and ? and brand = ? " +
				"UNION " +
				"select date_format(date, '%m') month, date_format(date, '%Y') as year, sale, cancel, totalvisit, firstvisit, revisit, newmember,pv, perman, buyer " +
				"from statics where date between '" + firstDayLastYear + "' and ? and brand = ?) as t group by month " +
				"UNION " +
				"select '합계',  " +
					"SUM(case when year = " + lastYear + " then sale end) as 'lastSale', " +
					"SUM(case when year = " + thisYear + " then sale end) as 'currentSale', " +
					"SUM(case when year = " + lastYear + " then cancel end) as 'lastCancel', " + 
                    "SUM(case when year = " + thisYear + " then cancel end) as 'currentCancel', " +
				    "SUM(case when year = " + lastYear + " then totalvisit end) as 'lastTotalvisit', " +
					"SUM(case when year = " + thisYear + " then totalvisit end) as 'currentTotalvisit', " +
				    "SUM(case when year = " + lastYear + " then firstvisit end) as 'lastFirstvisit', " +
					"SUM(case when year = " + thisYear + " then firstvisit end) as 'currentFirstvisit', " +
				    "SUM(case when year = " + lastYear + " then revisit end) as 'lastRevisit', " +
					"SUM(case when year = " + thisYear + " then revisit end) as 'currentRevisit', " +
				    "SUM(case when year = " + lastYear + " then newmember end) as 'lastNewmember', " +
					"SUM(case when year = " + thisYear + " then newmember end) as 'currentNewmember', " +
				    "SUM(case when year = " + lastYear + " then pv end) as 'lastPv', " +
					"SUM(case when year = " + thisYear + " then pv end) as 'currentPv', " +
				    "ROUND(AVG(case when year = " + lastYear + " then perman end)) as 'lastPerman', " +
					"ROUND(AVG(case when year = " + thisYear + " then perman end)) as 'currentPerman', " +
				    "ROUND(AVG(case when year = " + lastYear + " then buyer end),2) as 'lastBuyer', " +
					"ROUND(AVG(case when year = " + thisYear + " then buyer end),2) as 'currentBuyer' " +
				"FROM (select '합계' total, date_format(date, '%Y') as year, sale, cancel, totalvisit, firstvisit, revisit, newmember,pv, perman, buyer " +
				"FROM statics where date between '" + firstDayThisYear + "' and ? and brand = ? " +
				"UNION " +
				"select '합계' total, date_format(date, '%Y') as year, sale, cancel, totalvisit, firstvisit, revisit, newmember,pv, perman, buyer " +
				"FROM statics where date between '" + firstDayLastYear + "' and ? and brand = ?) as t group by total", 
			[current, brand, previous, brand, current, brand, previous, brand], function(err, results) {
		if(err){
			console.log("Error : " + err);
		}
		
		for (var i = 0; i < results.length; i++) {
			var obj = {};
			obj.month = results[i].month;
			obj.lastSale = results[i].lastSale;
			obj.currentSales = results[i].currentSale;
			obj.lastCancel = results[i].lastCancel;
			obj.currentCancel = results[i].currentCancel;
			obj.lastTotalvisit = results[i].lastTotalvisit;
			obj.currentTotalvisit = results[i].currentTotalvisit;
			obj.lastFirstvisit = results[i].lastFirstvisit;
			obj.currentFirstvisit = results[i].currentFirstvisit;
			obj.lastRevisit = results[i].lastRevisit;
			obj.currentRevisit = results[i].currentRevisit;
			obj.lastNewmember = results[i].lastNewmember;
			obj.currentNewmember = results[i].currentNewmember;
			obj.lastPv = results[i].lastPv;
			obj.currentPv = results[i].currentPv;
			obj.lastPerman = results[i].lastPerman;
			obj.currentPerman = results[i].currentPerman;
			obj.lastBuyer = results[i].lastBuyer;
			obj.currentBuyer = results[i].currentBuyer;
			response.push(obj);
		}
		
		res.send(response);
	});
});

function resRangeGroup(res, start, end, brand, mode) {
	var response = {};
	var query = null;
	switch(mode) {
	case "totalvisit" :
		query = "SELECT DATE_FORMAT(date,'%Y-%m') month, sum(totalvisit) value FROM statics WHERE date BETWEEN ? AND ? AND brand = ? group by month";
		break;
	case "firstvisit" :
		query = "SELECT DATE_FORMAT(date,'%Y-%m') month, sum(firstvisit) value FROM statics WHERE date BETWEEN ? AND ? AND brand = ? group by month";
		break;
	case "revisit" :
		query = "SELECT DATE_FORMAT(date,'%Y-%m') month, sum(revisit) value FROM statics WHERE date BETWEEN ? AND ? AND brand = ? group by month";
		break;
	case "newmember" :
		query = "SELECT DATE_FORMAT(date,'%Y-%m') month, sum(newmember) value FROM statics WHERE date BETWEEN ? AND ? AND brand = ? group by month";
		break;
	case "pv" :
		query = "SELECT DATE_FORMAT(date,'%Y-%m') month, sum(pv) value FROM statics WHERE date BETWEEN ? AND ? AND brand = ? group by month";
		break;
	case "perman" :
		query = "SELECT DATE_FORMAT(date,'%Y-%m') month, avg(perman) value FROM statics WHERE date BETWEEN ? AND ? AND brand = ? group by month";
		break;
	case "buyer" :
		query = "SELECT DATE_FORMAT(date,'%Y-%m') month, avg(buyer) value FROM statics WHERE date BETWEEN ? AND ? AND brand = ? group by month";
		break;
	}

	conn.query(query, [start, end, brand], function(err, results) {
		if(err) {
			console.log("Error : " + err);
		}
		
		var values = [];
		for (var i = 0; i < results.length; i++) {
			var obj = {};
			obj.day = results[i].month;
			obj.value = results[i].value;
			values.push(obj);
		}
		
		response.brand = brand;
		response.start = start;
		response.end = end;
		response.values = values;
		res.send(response);
	});
}

router.get('/range/this-year-totalvisit-group-month/:brand', function (req, res, next){ // 금일부터 12개월 이전에 데이터를 월단위 그룹 
	var end = DateUtil.lastday();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "totalvisit");
});

router.get('/range/last-year-totalvisit-group-month/:brand', function (req, res, next){ // 작년 오늘날짜부터 12개월 이전에 데이터를 월단위 그룹
	var end = DateUtil.lastdayinlastyear();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "totalvisit");
});

router.get('/range/this-year-firstvisit-group-month/:brand', function (req, res, next){ // 금일부터 12개월 이전에 데이터를 월단위 그룹 
	var end = DateUtil.lastday();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "firstvisit");
});

router.get('/range/last-year-firstvisit-group-month/:brand', function (req, res, next){ // 작년 오늘날짜부터 12개월 이전에 데이터를 월단위 그룹
	var end = DateUtil.lastdayinlastyear();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "firstvisit");
});

router.get('/range/this-year-revisit-group-month/:brand', function (req, res, next){ // 금일부터 12개월 이전에 데이터를 월단위 그룹 
	var end = DateUtil.lastday();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "revisit");
});

router.get('/range/last-year-revisit-group-month/:brand', function (req, res, next){ // 작년 오늘날짜부터 12개월 이전에 데이터를 월단위 그룹
	var end = DateUtil.lastdayinlastyear();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "revisit");
});

router.get('/range/this-year-newmember-group-month/:brand', function (req, res, next){ // 금일부터 12개월 이전에 데이터를 월단위 그룹 
	var end = DateUtil.lastday();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "newmember");
});

router.get('/range/last-year-newmember-group-month/:brand', function (req, res, next){ // 작년 오늘날짜부터 12개월 이전에 데이터를 월단위 그룹
	var end = DateUtil.lastdayinlastyear();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "newmember");
});

router.get('/range/this-year-pv-group-month/:brand', function (req, res, next){ // 금일부터 12개월 이전에 데이터를 월단위 그룹 
	var end = DateUtil.lastday();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "pv");
});

router.get('/range/last-year-pv-group-month/:brand', function (req, res, next){ // 작년 오늘날짜부터 12개월 이전에 데이터를 월단위 그룹
	var end = DateUtil.lastdayinlastyear();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "pv");
});

router.get('/range/this-year-perman-group-month/:brand', function (req, res, next){ // 금일부터 12개월 이전에 데이터를 월단위 그룹 
	var end = DateUtil.lastday();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "perman");
});

router.get('/range/last-year-perman-group-month/:brand', function (req, res, next){ // 작년 오늘날짜부터 12개월 이전에 데이터를 월단위 그룹
	var end = DateUtil.lastdayinlastyear();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "perman");
});

router.get('/range/this-year-buyer-group-month/:brand', function (req, res, next){ // 금일부터 12개월 이전에 데이터를 월단위 그룹 
	var end = DateUtil.lastday();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "buyer");
});

router.get('/range/last-year-buyer-group-month/:brand', function (req, res, next){ // 작년 오늘날짜부터 12개월 이전에 데이터를 월단위 그룹
	var end = DateUtil.lastdayinlastyear();
	var start = DateUtil.firstDayMonthLastYear(end);
	var brand = req.params.brand;
	
	resRangeGroup(res, start, end, brand, "buyer");
});

module.exports = router;
