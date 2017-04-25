var serialport = require("serialport"),
	sqlhelper = require("./sql-helper"), 
	dateTime = require('node-datetime');
	
var serialPortName = "COM2";

var serialPort = new serialport(serialPortName, {
	baudrate: 9600,
	dataBits : 8,
	parity : 'none',
	stopBits: 1,
	flowControl : false
});

var started = false;
var routeId = null;
const uuidV1 = require('uuid/v1');

serialPort.on("open", function () {
	console.log('Serial port "' + serialPortName + '" open ...\n');
	serialPort.on("data", function(data) {
		console.log("Serial data: " + data.toString());
		
		if(data.toString() == 1 && !started) {
			started = true;
			
			routeId = uuidV1();
			var dt = dateTime.create();
			var now = dt.format('Y-m-d H:M:S');
			var routeData = {routeId: routeId, startDate: now, endDate: null};
			sqlhelper.insert("route", routeData, function(data) {
				console.log(data);
			});
		}
		
		if(data.toString() == 0 && started) {
			started = false;
			
			var dt = dateTime.create();
			var now = dt.format('Y-m-d H:M:S');
			var routeData = {endDate: now};
			var condition = {routeId: routeId};
			sqlhelper.update("route", routeData, condition, function(data) {
				console.log(data);
			});
		}
		
		if(data.toString() != 0 && data.toString() != 1 && started){
			var geoJSON = JSON.parse(data.toString());
			var geoId = uuidV1();
			var dt = dateTime.create();
			var now = dt.format('Y-m-d H:M:S');
			
			var latVal = parseFloat(geoJSON["latitude"].toString().substring(0,2)) + parseFloat(geoJSON["latitude"].toString().substring(2,4))/60 + parseFloat(geoJSON["latitude"].toString().substring(4,9))/60;
			var longVal = parseFloat(geoJSON["longitude"].toString().substring(0,2)) + parseFloat(geoJSON["longitude"].toString().substring(2,4))/60 + parseFloat(geoJSON["longitude"].toString().substring(4,9))/60;
			var altVal = parseFloat(geoJSON["altitude"].toString().substring(0,2)) + parseFloat(geoJSON["altitude"].toString().substring(2,4))/60 + parseFloat(geoJSON["altitude"].toString().substring(4,9))/60;
			
			var geoData = {geoId: geoId, routeId: routeId, latitude: latVal, longitude: longVal, altitude: altVal, time: now};
			sqlhelper.insert("geoData", geoData, function(data) {
				console.log(data);
			});
		}
	});
});