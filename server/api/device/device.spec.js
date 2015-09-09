'use strict';

var testdata = require('../../config/testdata');
var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Device = require('./device.model');
var User = require('../user/user.model');

var token = '';

describe('Device API', function() {
	beforeEach(function (done) {
		User.remove().exec().then(function() {
			new User(testdata.admin).save(function(err) {
				if(err) done(err);
				request(app)
					.post('/auth/local')
					.send({
				  	"email": testdata.admin.email,
				  	"password": testdata.admin.password
					})
					.end(function (err, res) {
						if (err) throw err;
						token = res.body.token;
						Device.remove().exec().then(function() {
							done();
						});
					});
			});
		});
	});

	it('should GET all devices', function(done) {
		request(app)
			.get('/api/devices')
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if(err) return done(err);
				res.body.should.be.instanceOf(Array);
				done();
			});
	});

	it('should add a valid device', function(done) {
		request(app)
			.post('/api/devices')
			.send({
				name: 'mac01',
				mac: '01:01:01:01:01:01'
			})
			.set('Authorization', 'Bearer ' + token)
			.expect(200)
			.end(function(err, res) {
				if(err) throw err;
				res.body.should.have.property('_id');
				done();
			});
	});

	it('should edit a device', function(done) {
		new Device(testdata.device[1]).save(function(err, device) {
			if(err) throw err;
			var deviceDup = JSON.parse(JSON.stringify(device));
			delete deviceDup._id;
			delete deviceDup.__v;
			deviceDup.mac = '01:01:01:01:01:0F';
			deviceDup.name = 'mac02';
			request(app)
				.put('/api/devices/' + device._id)
				.set('Authorization', 'Bearer ' + token)
				.expect(205)
				.send(deviceDup)
				.end(function(err, res) {
					if(err) throw err;
					Device.findOne({_id: device._id}, function(err, device) {
						if(err) throw err;
						device.mac.should.be.exactly(deviceDup.mac.toLowerCase());
						device.name.should.be.exactly(deviceDup.name);
						done();
					});
				});
		});
	});

	it('should delete a device', function(done) {
		new Device(testdata.device[1]).save(function(err, device) {
			request(app)
				.delete('/api/devices/' + device._id)
				.set('Authorization', 'Bearer ' + token)
				.expect(204)
				.end(function(err, res) {
					if(err) throw err;
					Device.findById(device._id, function(err, device) {
						device.disabled.should.be.exactly(true);
						done();
					});
				});
		});
	});

	it('should fail to delete if device is already in use', function(done) {
		new Device(testdata.device[1]).save(function(err, device) {
			if(err) throw err;
			var userDup = new User(testdata.user[1]);
			userDup.devices = [{
				deviceId: device._id
			}];
			userDup.save(function(err, user) {
				if(err) throw err;
				request(app)
					.delete('/api/devices/' + device._id)
					.set('Authorization', 'Bearer ' + token)
					.expect(422)
					.end(function(err, res) {
						if(err) throw err;
						should.exist(res.body.errors);
						done();
					});
			});
		});
	});

});