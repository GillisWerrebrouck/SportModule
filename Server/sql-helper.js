var mysql = require("mysql");
var async = require("./async");

dbConnection = {
	connection: null,
	connect: function(){
		this.connection = mysql.createConnection({
			host     : "localhost",
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

SQLHelper.prototype.select = function(table) {
	dbConnection.connect();
	dbConnection.connection.query("SELECT * FROM " + table, function(err, rows, fields) {
		async.get(rows);
	});
	dbConnection.end();
};

SQLHelper.prototype.insert = function(table, data) {
	dbConnection.connect();
	dbConnection.connection.query("INSERT into " + table + " SET ?", data, function(err, result) {
		async.get(result);
	});
	dbConnection.end();
};

SQLHelper.prototype.update = function(table, data, condition) {
	var stmt = "UPDATE " + table + " SET ";
	var values = [];
	
	for(var d in data) {
		stmt += " " + d + " = ? ";
		values.push(data[d]);
	}
	
	stmt += " WHERE ";
	for(var c in condition) {
		stmt += c + " = ? ";
		values.push(condition[c]);
		if(c.next)
			stmt += ", ";
	}
	
	stmt = stmt.replace(/ +/g, ' ');
	
	dbConnection.connect();
	dbConnection.connection.query(stmt, values, function(err, results, fields) {
		async.get(results);
	});
	dbConnection.end();
};

module.exports = new SQLHelper();