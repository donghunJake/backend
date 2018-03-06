var express = require('express');
var router = express.Router();
var sales = require('../sales.json');
var conn = require('../util/dbconnection');
var DateUtil = require('../util/DateUtil');

router.get('/', function (req, res, next) {
	var response = [];
	
	var previousWeek = DateUtil.lastweek();
	var currentDate = DateUtil.today();
	
	conn.query("select brand, " +
			"sum(case when date = ? then sale end) as previousWeek, " +
			"sum(case when date = ? then sale end) as currentSales " +
			"from statics where date =? or date = ? group by brand order by currentSales desc", 
			[previousWeek, currentDate, previousWeek, currentDate], function(err, results) {
		if(err){
			console.log("Error : " + err);
		}
		
		for (var i = 0; i < results.length; i++) {
			var obj = {};
			console.log(results[i].brand);
			obj.company = results[i].brand;
			obj.previousWeek = results[i].previousWeek;
			obj.currentSales = results[i].currentSales;
			obj.growthWeek = results[i].currentSales - results[i].previousWeek;
			response.push(obj);
		}
		
		res.send(response);
	})
});

module.exports = router;
