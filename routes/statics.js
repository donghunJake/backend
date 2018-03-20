var express = require('express');
var router = express.Router();
var statics = require('../statics.json');
var conn = require('../util/dbconnection');
var DateUtil = require('../util/DateUtil');

/* GET statics listing. */
router.get('/:brand', function(req, res, next) {
	var response = [];
	
	var brand = req.params.brand;
	var current = DateUtil.lastday();
	var previous = DateUtil.lastdayinlastyear();
	
	conn.query("select month, " +
					"SUM(case when year = 2017 then sale end) as 'lastSale', " +
					"SUM(case when year = 2018 then sale end) as 'currentSale', " +
				    "SUM(case when year = 2017 then totalvisit end) as 'lastTotalvisit', " +
					"SUM(case when year = 2018 then totalvisit end) as 'currentTotalvisit', " +
				    "SUM(case when year = 2017 then firstvisit end) as 'lastFirstvisit', " +
					"SUM(case when year = 2018 then firstvisit end) as 'currentFirstvisit', " +
				    "SUM(case when year = 2017 then revisit end) as 'lastRevisit', " +
					"SUM(case when year = 2018 then revisit end) as 'currentRevisit', " +
				    "SUM(case when year = 2017 then newmember end) as 'lastNewmember', " +
					"SUM(case when year = 2018 then newmember end) as 'currentNewmember', " +
				    "SUM(case when year = 2017 then pv end) as 'lastPv', " +
					"SUM(case when year = 2018 then pv end) as 'currentPv', " +
				    "ROUND(AVG(case when year = 2017 then perman end)) as 'lastPerman', " +
					"ROUND(AVG(case when year = 2018 then perman end)) as 'currentPerman', " +
				    "ROUND(AVG(case when year = 2017 then buyer end),2) as 'lastBuyer', " +
					"ROUND(AVG(case when year = 2018 then buyer end),2) as 'currentBuyer' " +
				"FROM (select date_format(date, '%m') month, date_format(date, '%Y') as year, sale, totalvisit, firstvisit, revisit, newmember,pv, perman, buyer " +
				"FROM statics where date between '2018-01-01' and ? and brand = ? " +
				"UNION " +
				"select date_format(date, '%m') month, date_format(date, '%Y') as year, sale, totalvisit, firstvisit, revisit, newmember,pv, perman, buyer " +
				"from statics where date between '2017-01-01' and ? and brand = ?) as t group by month " +
				"UNION " +
				"select '합계',  " +
					"SUM(case when year = 2017 then sale end) as 'lastSale', " +
					"SUM(case when year = 2018 then sale end) as 'currentSale', " +
				    "SUM(case when year = 2017 then totalvisit end) as 'lastTotalvisit', " +
					"SUM(case when year = 2018 then totalvisit end) as 'currentTotalvisit', " +
				    "SUM(case when year = 2017 then firstvisit end) as 'lastFirstvisit', " +
					"SUM(case when year = 2018 then firstvisit end) as 'currentFirstvisit', " +
				    "SUM(case when year = 2017 then revisit end) as 'lastRevisit', " +
					"SUM(case when year = 2018 then revisit end) as 'currentRevisit', " +
				    "SUM(case when year = 2017 then newmember end) as 'lastNewmember', " +
					"SUM(case when year = 2018 then newmember end) as 'currentNewmember', " +
				    "SUM(case when year = 2017 then pv end) as 'lastPv', " +
					"SUM(case when year = 2018 then pv end) as 'currentPv', " +
				    "ROUND(AVG(case when year = 2017 then perman end)) as 'lastPerman', " +
					"ROUND(AVG(case when year = 2018 then perman end)) as 'currentPerman', " +
				    "ROUND(AVG(case when year = 2017 then buyer end),2) as 'lastBuyer', " +
					"ROUND(AVG(case when year = 2018 then buyer end),2) as 'currentBuyer' " +
				"FROM (select '합계' total, date_format(date, '%Y') as year, sale, totalvisit, firstvisit, revisit, newmember,pv, perman, buyer " +
				"FROM statics where date between '2018-01-01' and ? and brand = ? " +
				"UNION " +
				"select '합계' total, date_format(date, '%Y') as year, sale, totalvisit, firstvisit, revisit, newmember,pv, perman, buyer " +
				"FROM statics where date between '2017-01-01' and ? and brand = ?) as t group by total", 
			[current, brand, previous, brand, current, brand, previous, brand], function(err, results) {
		if(err){
			console.log("Error : " + err);
		}
		
		for (var i = 0; i < results.length; i++) {
			var obj = {};
			obj.month = results[i].month;
			obj.lastSale = results[i].lastSale;
			obj.currentSales = results[i].currentSale;
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

module.exports = router;
