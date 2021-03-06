var mysql = require("mysql");

dbConnection = {
	connection: null,
	connect: function(){
		this.connection = mysql.createConnection({
			host     : "127.0.0.2",
			user     : "root",
			password : "pass123",
			database : "sportmoduledb"
		});
		this.connection.connect();
	},
	end: function(){
		this.connection.end();
		this.connection = null;
	}
};

function SQLHelper() {};

SQLHelper.prototype.selectAll = function(table, callback) {
	dbConnection.connect();
	dbConnection.connection.query("SELECT * FROM " + table, function(err, rows) {
		callback(err, rows);
	});
	dbConnection.end();
};

SQLHelper.prototype.select = function(table, conditions, callback) {
	var stmt = "SELECT * FROM " + table + " WHERE ";
	var values = [];
	for(var c in conditions) {
		stmt += c + " = ? ";
		values.push(conditions[c]);
		if(c.next)
			stmt += ", ";
	}
	
	stmt = stmt.replace(/ +/g, ' ');

	dbConnection.connect();
	dbConnection.connection.query(stmt, values, function(err, rows) {
		callback(err, rows);
	});
	dbConnection.end();
};

SQLHelper.prototype.insert = function(table, data, callback) {
	dbConnection.connect();
	dbConnection.connection.query("INSERT into " + table + " SET ?", data, function(err, result) {
		callback(result);
	});
	dbConnection.end();
};

SQLHelper.prototype.update = function(table, data, conditions, callback) {
	var stmt = "UPDATE " + table + " SET ";
	var values = [];
	
	for(var d in data) {
		stmt += " " + d + " = ? ";
		values.push(data[d]);
	}
	
	stmt += " WHERE ";
	for(var c in conditions) {
		stmt += c + " = ? ";
		values.push(conditions[c]);
		if(c.next)
			stmt += ", ";
	}
	
	stmt = stmt.replace(/ +/g, ' ');
	
	dbConnection.connect();
	dbConnection.connection.query(stmt, values, function(err, results, fields) {
		callback(results);
	});
	dbConnection.end();
};

module.exports = new SQLHelper();