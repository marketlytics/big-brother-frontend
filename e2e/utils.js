var testdata = require('./testdata');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Device = mongoose.model('Device');

var getObjects = function(data) {
	var objects = [];
	for(var key in data) {
		if( !isNaN(parseInt(key)) ) {
			objects.push(data[key]);
		}
	}
	return objects;
};

exports.resetDatabase = function(done) {
	mongoose.connect('mongodb://localhost/bigbrother-test');
	var db = mongoose.connection;
	db.once('open', function() {
		User.remove().exec().then(function() {
			Device.remove().exec().then(function() {
				Device.create(getObjects(testdata.devices), function(err) {
					if(err) {
						console.log(err);
						process.exit(1);
					}
					User.create(getObjects(testdata.users), function(err) {
						if(err) {
							console.log(err);
							process.exit(1);
						}
						mongoose.connection.close();
						done();
					});
				});
			});
		});
	});
};