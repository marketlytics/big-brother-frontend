'use strict';

var Device = require('./device.model');
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

exports.create = function(req, res) {
	var device = new Device(req.body);
	Device.save(device, function(err, device) {
		if (err) return validationError(res, err);
    	res.status(200).send('OK');
	});
};

exports.destroy = function(req, res) {
	Device.findByIdAndUpdate(req.params.id, { disabled: true }, function(err) {
		if (err) return res.status(500).send(err);
		res.status(204).send('No Content');
	});
};

exports.edit = function(req, res) {
	Device.findOneAndUpdate(req.params.id, req.body, {upsert: true}, function(err, device) {
		if (err) return validationError(res, err);
		res.status(205);
	});
};