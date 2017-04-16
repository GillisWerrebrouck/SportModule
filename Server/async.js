function Async() {};

Async.prototype.get = function(data)  {
	asyncTimer = setInterval(function(){ 
		if(data != "undefined"){
			clearInterval(asyncTimer);
			console.log(data);
			return data;
		}
	}, 1);
};

module.exports = new Async();