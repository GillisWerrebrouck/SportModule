var serialport = require("serialport"),
	sqlhelper = require("./sql-helper"), 
	dateTime = require('node-datetime');
	
var serialPortName = "/dev/ttyUSB0";
// var serialPortName = "COM2";

var serialPort = new serialport(serialPortName, {
	baudrate: 9600,
	dataBits : 8,
	parity : 'none',
	stopBits: 1,
	flowControl : false
});

var started = false;
var sendingGeoData = false;
var currentGeoData = "";
var routeId = null;
const uuidV1 = require('uuid/v1');

serialPort.on("open", function () {
	console.log('Serial port "' + serialPortName + '" open ...\n');
	serialPort.on("data", function(data) {		
		if(data.toString().indexOf("#") > -1) {
			sendingGeoData = !sendingGeoData;
			if(sendingGeoData)
				console.log("SENDING GEO DATA");
			else
				console.log("NOT SENDING GEO DATA");
		}
		
		if(!sendingGeoData && data.toString().indexOf("1") > -1 && !started) {
			started = true;
			console.log("ROUTE STARTED");
			
			routeId = uuidV1();
			var dt = dateTime.create();
			var now = dt.format('Y-m-d H:M:S');
			var routeData = {routeId: routeId, startDate: now, endDate: null};
			sqlhelper.insert("route", routeData, function(data) {
				console.log(data);
			});
		}
		
		if(!sendingGeoData && data.toString().indexOf("0") > -1 && started) {
			started = false;
			console.log("ROUTE ENDED");
			
			var dt = dateTime.create();
			var now = dt.format('Y-m-d H:M:S');
			var routeData = {endDate: now};
			var condition = {routeId: routeId};
			sqlhelper.update("route", routeData, condition, function(data) {
				console.log(data);
			});
		}
		
		if(sendingGeoData && started){
			currentGeoData += data.toString().replace("#","");
			console.log("RECEIVING GEO DATA");
		} else if (currentGeoData != "") {
			console.log("GEO JSON: " + currentGeoData);
			try {
				var geoJSON = JSON.parse(currentGeoData);
			} catch (err) {
				console.log(err);
				currentGeoData = "";
				return;
			}
			currentGeoData = "";
			var geoId = uuidV1();
			var dt = dateTime.create();
			var now = dt.format('Y-m-d H:M:S');
			
			var latVal, longVal, altVal = 0;
			if(geoJSON["latitude"] != undefined && geoJSON["latitude"] != null && geoJSON["latitude"] != "" && geoJSON["latitude"] != "0")
				latVal = parseFloat(geoJSON["latitude"].toString().substring(0,2)) + parseFloat(geoJSON["latitude"].toString().substring(2,4))/60 + parseFloat(geoJSON["latitude"].toString().substring(4,9))/60;
			if(geoJSON["longitude"] != undefined && geoJSON["longitude"] != null && geoJSON["longitude"] != "" && geoJSON["longitude"] != "0")
				longVal = parseFloat(geoJSON["longitude"].toString().substring(0,2)) + parseFloat(geoJSON["longitude"].toString().substring(2,4))/60 + parseFloat(geoJSON["longitude"].toString().substring(4,9))/60;
			if(geoJSON["altitude"] != undefined && geoJSON["altitude"] != null)
				altVal = parseFloat(geoJSON["altitude"].toString());

			var geoData = {geoId: geoId, routeId: routeId, latitude: latVal, longitude: longVal, altitude: altVal, time: now};
				console.log(geoData);
			sqlhelper.insert("geodata", geoData, function(data) {
				console.log(data);
			});
		}
	});
});