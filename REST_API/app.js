var express = require("express"),
    router  = express.Router(),
    app     = express(),
    sqlhelper = require("./sql-helper"),
    port    = 3000;

//routes
router.get('/', function (req, res) {
    res.send({ message: "This is the api endpoint for the sportmodule"});
});

router.get('/route', function (req, res) {
    res.header("Access-Controll-Allow-Origin", "*");
    sqlhelper.selectAll("route", function(err, rows) {		
	if(err) {
            res.jsonp({"Message" : "Error executing MySQL query1"});
        } else {
            res.jsonp(rows);
        }
    });
});

router.get('/geo/:routeId', function (req, res) {
    var condition = {routeId: req.params.routeId};
    sqlhelper.select("geodata", condition, function(err, rows) {		
        if(err) {
            res.jsonp({"Message" : "Error executing MySQL query"});
        } else {
            res.jsonp(rows);
        }
    });
});

router.get('/tph/:routeId', function (req, res) {
    var condition = {routeId: req.params.routeId};
    sqlhelper.select("tphdata", condition, function(err, rows) {		
        if(err) {
            res.jsonp({"Message" : "Error executing MySQL query"});
        } else {
            res.jsonp(rows);
        }
    });
});

// prefix route with /api
app.use('/api', router);

// start server
app.listen(port);
console.log("Listening on port " + port + "...");