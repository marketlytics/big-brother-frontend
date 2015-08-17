'use strict';

var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of admin
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({role: 'admin'}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Get a single admin
 * restriction: 'admin'
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;
  
  User.findOne({_id: userId, role: 'admin'}, '-salt -hashedPassword', function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Creates a new admin
 */
exports.create = function(req, res) {
  var newUser = new User(req.body);
  newUser.role = 'admin';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    res.status(200);
  });
};

/**
 * Deletes an admin
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err) {
    if(err) return res.status(500).send(err);
    res.status(204).send('No Content');
  })
};

/**
 * Change an admin's password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};