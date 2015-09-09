'use strict';

var testdata = require('../../config/testdata');
var should = require('should');
var User = require('../user/user.model');
var Device = require('./device.model');

describe('Device Model', function() {

	beforeEach(function(done) {
		Device.remove().exec().then(function() {
			done();
		});
	});

	it('should begin with no devices', function(done) {
		Device.find({}, function(err, devices) {
			devices.should.have.length(0);
			done();
		});
	});

	it('should fail when saving if name is not present', function(done) {
		var deviceDup = new Device(testdata.device[1]);
		deviceDup.name = '';
		deviceDup.save(function(err, device) {
			should.exist(err);
			done();
		});
	});

	it('should fail when saving if mac is not present', function(done) {
		var deviceDup = new Device(testdata.device[1]);
		deviceDup.mac = '';
		deviceDup.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should fail when saving if mac is not valid', function(done) {
		var deviceDup = new Device(testdata.device[1]);
		deviceDup.mac = '01:a1:asdf:12321';
		deviceDup.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should fail when saving with a duplicate device - (same mac)', function(done) {
		testdata.device[1].save(function(err, device1) {
			var deviceDup = new Device(testdata.device[2]);
			deviceDup.mac = device1.mac;
			deviceDup.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	it('should fail when saving with a duplicate device - (same name)', function(done) {
		new Device(testdata.device[1]).save(function(err, device_1) {
			var deviceDup = new Device(testdata.device[2]);
			deviceDup.name = device_1.name;
			deviceDup.save(function(err, device_2) {
				should.exist(err);
				done();
			});
		});
	});

	it('should save devices', function(done) {
		new Device(testdata.device[1]).save(function(err, device_1) {
			new Device(testdata.device[2]).save(function(err, device_2) {
				Device.find({}, function(err, devices) {
					devices.should.have.length(2);
					done();
				});
			});
		});
	});

});