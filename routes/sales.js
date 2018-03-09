var express = require('express');
var router = express.Router();
var sales = require('../sales.json');
var conn = require('../util/dbconnection');
var DateUtil = require('../util/DateUtil');

router.get('/lastweek', function (req, res, next) {
	var response = [];
	
	var current = DateUtil.lastday();
	var previous = DateUtil.previousweek();
	console.log(previous, current);
	conn.query("select brand, " +
			"sum(case when date = ? then sale end) as previous, " +
			"sum(case when date = ? then sale end) as current " +
			"from statics where date =? or date = ? group by brand order by current desc", 
			[previous, current, previous, current], function(err, results) {
		if(err){
			console.log("Error : " + err);
		}
		
		for (var i = 0; i < results.length; i++) {
			var obj = {};
			obj.company = results[i].brand;
			obj.previous = results[i].previous;
			obj.current = results[i].current;
			obj.growth = results[i].current - results[i].previous;
			response.push(obj);
		}
		
		res.send(response);
	});
});

router.get('/lastyear', function (req, res, next) {
	var response = [];
	
	var currentlastyear = DateUtil.lastdayofweekinlastyear();
	var previouslastyear = DateUtil.lastweek(currentlastyear);
	
	var current = DateUtil.lastday();
	var previous = DateUtil.lastweek(current);
	
	console.log(previouslastyear, currentlastyear, previous, current);
	conn.query("select brand, " +
			"sum(case when date between ? and ?  then sale end) as previous, " +
			"sum(case when date between ? and ? then sale end) as current " +
			"from statics where date between ? and ? or date between ? and ? group by brand order by current desc", 
			[previouslastyear, currentlastyear, previous, current, previouslastyear, currentlastyear, previous, current], function(err, results) {
		if(err){
			console.log("Error : " + err);
		}
		
		for (var i = 0; i < results.length; i++) {
			var obj = {};
			obj.company = results[i].brand;
			obj.previous = results[i].previous;
			obj.current = results[i].current;
			obj.growth = results[i].current - results[i].previous;
			response.push(obj);
		}
		
		res.send(response);
	});
});

function isValidDate (dateString) {
	var regEx = /^\d{4}-\d{2}-\d{2}$/;
	if(!dateString.match(regEx)) {
		return false;  // Invalid format
	}
	var d = new Date(dateString);
	if(!d.getTime() && d.getTime() !== 0) {
		return false; // Invalid date
	}
	return d.toISOString().slice(0,10) === dateString;
}

function isValidDateRange (dateString) {
	var regEx = /^\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}$/;
	
	if (!dateString.match(regEx)) {
		return false;
	}
	var d = dateString.split(':');
	if(!isValidDate(d[0]) && !isValidDate(d[1])) {
		return false;
	}
	return true;
}

function resPointSale (res, start, end) {
	var argLength = arguments.length;
	var query = null;
	
	if (argLength === 3 ) {
		query = "SELECT brand, SUM(sale) sale FROM statics WHERE date BETWEEN ? AND ? GROUP BY brand";
	} else if (argLength === 4) {
		query = "SELECT brand, SUM(sale) sale FROM statics WHERE date BETWEEN ? AND ? AND BRAND = \'" + arguments[3] + "\'";
	}
	
	var response = [];

	conn.query(query, [start, end], function(err, results) {
		if(err) {
			console.log("Error : " + err);
		}
		for (var i = 0; i < results.length; i++) {
			var obj = {};
			obj.brand = results[i].brand;
			obj.sale = results[i].sale;
			obj.start = start;
			obj.end = end;
			response.push(obj);
		}
		res.send(response);
	});
}

router.get('/point/last-day', function (req, res, next){
	var lastDate = DateUtil.lastday();
	
	resPointSale(res, lastDate, lastDate);
});

router.get('/point/last-day/:brand', function (req, res, next){
	var lastDate = DateUtil.lastday();
	var brand = req.params.brand;
	
	resPointSale(res, lastDate, lastDate, brand);
});

router.get('/point/last-week', function (req, res, next) {
	var lastDate = DateUtil.lastday();
	var lastWeek = DateUtil.lastweek(lastDate);
	
	resPointSale(res, lastWeek, lastDate);
});

router.get('/point/last-week/:brand', function (req, res, next) {
	var lastDate = DateUtil.lastday();
	var lastWeek = DateUtil.lastweek(lastDate);
	var brand = req.params.brand;
	
	resPointSale(res, lastWeek, lastDate, brand);
});

router.get('/point/last-month', function (req, res, next) {
	var lastDate = DateUtil.lastday();
	var lastMonth = DateUtil.lastmonth(lastDate);
	
	resPointSale(res, lastMonth, lastDate);
});

router.get('/point/last-month/:brand', function (req, res, next) {
	var lastDate = DateUtil.lastday();
	var lastMonth = DateUtil.lastmonth(lastDate);
	var brand = req.params.brand;
	
	resPointSale(res, lastMonth, lastDate, brand);
});

router.get('/point/:date', function (req, res, next) {
	var date = req.params.date;
	
	if (isValidDateRange(date)) { // TODO : 특정 기간에 대한 에러체크 필요
		var d = date.split(':');
		var start = new Date(d[0]);
		var end = new Date(d[1]);
		if (start.getTime() <= end.getTime()) {
			resPointSale(res, d[0], d[1]);
		} else {
			res.send("error: end date < start date");
		}
	}
	else if (isValidDate(date)) { // TODO : 특정 기간에 대한 에러체크 필요
		resPointSale(res, date, date);
	} else {
		res.send("Date format Error!!");
	}
});

router.get('/point/:date/:brand', function (req, res, next) {
	var date = req.params.date;
	var brand = req.params.brand;
	
	if (isValidDateRange(date)) { // TODO : 특정 기간에 대한 에러체크 필요
		var d = date.split(':');
		var start = new Date(d[0]);
		var end = new Date(d[1]);
		if (start.getTime() <= end.getTime()) {
			resPointSale(res, d[0], d[1], brand);
		} else {
			res.send("error: end date < start date");
		}
	}
	else if (isValidDate(date)) { // TODO : 특정 기간에 대한 에러체크 필요
		resPointSale(res, date, date, brand);
	} else {
		res.send("Date format Error!!");
	}
});

function resRangeSale (res, start, end, brand) {
	var response = {};

	conn.query("SELECT DATE_FORMAT(date,'%Y-%m-%d') date, sale FROM statics WHERE date BETWEEN ? AND ? AND brand = ?", [start, end, brand], function(err, results) {
		if(err) {
			console.log("Error : " + err);
		}
		
		var sales = [];
		for (var i = 0; i < results.length; i++) {
			var obj = {};
			obj.day = results[i].date;
			obj.sale = results[i].sale;
			sales.push(obj);
		}
		
		response.brand = brand;
		response.start = start;
		response.end = end;
		response.sales = sales;
		res.send(response);
	});
}

router.get('/range/last-week/:brand', function (req, res, next){
	var end = DateUtil.lastday();
	var start = DateUtil.lastweek(end);
	var brand = req.params.brand;
	resRangeSale(res, start, end, brand);
});

router.get('/range/last-month/:brand', function (req, res, next){
	var end = DateUtil.lastday();
	var start = DateUtil.lastmonth(end);
	var brand = req.params.brand;
	
	resRangeSale(res, start, end, brand);
});

router.get('/range/last-month-year/:brand', function (req, res, next){
	var end = DateUtil.lastdayofweekinlastyear();
	var start = DateUtil.lastmonth(end);
	
	var brand = req.params.brand;
	resRangeSale(res, start, end, brand);
});

router.get('/range/:date/:brand', function (req, res, next) {
	var date = req.params.date;
	var brand = req.params.brand;
	
	if (isValidDateRange(date)) { // TODO : 특정 기간에 대한 에러체크 필요
		var d = date.split(':');
		var start = new Date(d[0]);
		var end = new Date(d[1]);
		if (start.getTime() <= end.getTime()) {
			resRangeSale(res, d[0], d[1], brand);
		} else {
			res.send("error: end date < start date");
		}
	} else {
		res.send("Date format Error!!");
	}
});

module.exports = router;
