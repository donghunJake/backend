/**
 * http://usejsdoc.org/
 */

var DateUtil = {};

function getDataStr(myDate) {
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();

	if (month < 10) {
		month = "0" + month;
	}

	if (day < 10) {
		day = "0" + day;
	}

	return year + "-" + month + "-" + day;
}

DateUtil.getDate = function (myDate, number) {
	var date = new Date(myDate);
	
	var dayOfMonth = date.getDate();
	date.setDate(dayOfMonth + number);
	
	return getDataStr(date);
}

DateUtil.lastday = function (){ // 오늘보다 하루 전 날짜
	var date = new Date();
	var dayOfMonth = date.getDate();
	date.setDate(dayOfMonth - 1);

	return getDataStr(date);
};

DateUtil.lastweek = function() {  // 인자가 없을 경우 오늘 날짜에서 6일 전 있을 경우 인자 값 에서 6일 전 
	var argLength = arguments.length;
	var date = null;
	
	if (argLength === 0 ) {
		date = new Date();
	} else if (argLength === 1) {
		date = new Date(arguments[0]);
	}
	var dayOfMonth = date.getDate();
	date.setDate(dayOfMonth - 6);

	return getDataStr(date);
};

DateUtil.previousweek = function () { // 인자가 없을 경우 오늘 날짜에서 8일 전 있을 경우 인자 값 에서 7일 전 
	var argLength = arguments.length;
	var dayOfMonth = null;
	var date = null;
	
	if (argLength === 0 ) {
		date = new Date();
		dayOfMonth = date.getDate();
		date.setDate(dayOfMonth - 8);
	} else if (argLength === 1) {
		date = new Date(arguments[0]);
		dayOfMonth = date.getDate();
		date.setDate(dayOfMonth - 7);
	}
	
	return getDataStr(date);
};

DateUtil.firstDayMonth = function(myDate) {
	var date = new Date(myDate);
	date.setDate(1);
	
	return getDataStr(date);
};

DateUtil.firstDayYear = function(myDate) {
	var date = new Date(myDate);
	date.setDate(1);
	date.setMonth(0);
	
	return getDataStr(date);
};

DateUtil.lastmonth = function() {
	var argLength = arguments.length;
	var date = null;
	
	if (argLength === 0 ) {
		date = new Date();
	} else if (argLength === 1) {
		date = new Date(arguments[0]);
	}
	
	var monthOfYear = date.getMonth();
	date.setMonth(monthOfYear - 1);
	
	return getDataStr(date);
};

DateUtil.lastdayinlastyear = function() { // 전년 동일 날짜
	var date = new Date();
	var year = date.getFullYear();
	var dayOfMonth = date.getDate();
	date.setDate(dayOfMonth - 1);
	date.setFullYear(year - 1);
	
	return getDataStr(date);
};

var weekOfYear = function(date){
    var d = new Date(+date);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

DateUtil.lastdayofweekinlastyear = function() { // 전년 동일 주, 동일요일의 날짜
	var date = new Date();
	var year = date.getFullYear();
	var dayOfMonth = date.getDate();
	var curDate = date.setDate(dayOfMonth - 1);
	var weekCur = weekOfYear(curDate);
	var preDate = date.setFullYear(year - 1);
	var weekPre = weekOfYear(preDate);
	
	var gap = (weekCur - weekPre) * 7; // 주차 사이의 차이
	date.setDate(dayOfMonth - gap);
	
	return getDataStr(date);
};

DateUtil.firstDayMonthLastYear = function(myDate) { // 12개월전의 달의 첫째 날짜
	var date = new Date(myDate);
	var monthOfYear = date.getMonth(); 
	date.setDate(1);
	date.setMonth(monthOfYear-11);
	
	return getDataStr(date);
};

module.exports = DateUtil;