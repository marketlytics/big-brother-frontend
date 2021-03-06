'use strict';

var Device = require('./device.model');
var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

exports.index = function(req, res) {
	Device.find({}, function(err, devices) {
		if(err) return res.status(500).send(err);
		res.status(200).json(devices);
	});
};

exports.show = function(req, res, next) {
	Device.findById(req.params.id, function(err, device) {
		if (err) return next(err);
		if (!user) return res.status(401).send('Unauthorized');
		res.json(device);
	});
};

exports.create = function(req, res, next) {
	var device = new Device(req.body);
	device.save(function(err, device) {
		if (err) return validationError(res, err);
		res.status(200).send(device);
	});
};

exports.destroy = function(req, res) {
	Device.findById(req.params.id, function(err, device) {
		if (err) return validationError(res, err);
		if (!device) return res.status(401).send('Unauthorized');
		User.findOne({'devices': {$elemMatch: { $and : [{deviceId: device._id}, {endedOn: {$exists: false}}]}}}, function(err, user) {
			if(err) res.status(500).send(err);
			else if (user) {
				validationError(res, {
					errors: {
						'device': {
							message: 'Device is already in use'
						}
					}
				});
			}
			else {
				device.update({disabled: true}, function(err) {
					if(err) res.status(500).send(err);
					else res.status(204).send('No Content');
				});
			}
		});
	});
};

exports.edit = function(req, res) {
	Device.findOne({_id: req.params.id}, function(err, device) {
		if (err) return validationError(res, err);
		if (!device) return res.status(401).send('Unauthorized');
		for(var key in req.body) {
			device[key] = req.body[key];
		}
		device.save(function(err, device) {
			if(err) return res.status(500).send(err);
			res.status(205).send('Reset Content');
		});
	});
};