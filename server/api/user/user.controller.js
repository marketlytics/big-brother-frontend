'use strict';

var User = require('./user.model');
var Device = require('../device/device.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 */
exports.index = function(req, res) {
  User.find({role: 'user'}, function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 * restriction: 'admin'
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    res.status(200).json(user);
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findOne({_id: userId, role: 'user'}, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

exports.showDeviceHistory = function(req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function(err, user) {
    if(err) return next(err);
    if(!user) return res.status(401).send('Unauthorized');
    var deviceIds = user.devices.map(function(userDevice) {
      return userDevice.deviceId;
    });
    Device.find({_id: {$in: deviceIds}}, function(err, devices) {
      if(err) return next(err);
      if(!devices) return res.status(500);
      var userDevices = [];
      user.devices.forEach(function(userDevice) {
        devices.forEach(function(device) {
          if(userDevice.deviceId.toString() === device._id.toString()) {
            var userDeviceDup = JSON.parse(JSON.stringify(userDevice));
            userDeviceDup.deviceInfo = JSON.parse(JSON.stringify(device));
            userDevices.push(userDeviceDup);
          }
        });
      });
      res.status(200).json(userDevices);
    });
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findOneAndRemove({_id: req.params.id, role: 'user'}, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Edits a user
 */
exports.edit = function(req, res) {
  User.findOne({_id: req.params.id, role: 'user'}, function(err, user) {
    if (err) return validationError(res, err);
    if (!user) return res.status(401).send('Unauthorized');
    for(var key in req.body) {
      user[key] = req.body[key];
    }
    user.save(function(err, user) {
      if(err) return res.status(500).send(err);
      res.status(205).send('Reset Content');
    });
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
