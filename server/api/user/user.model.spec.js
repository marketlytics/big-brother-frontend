'use strict';

var testdata = require('../../config/testdata');
var should = require('should');
var User = require('./user.model');
var Device = require('../device/device.model');
var moment = require('moment');

describe('User Model', function() {
  
  beforeEach(function(done) {
    User.remove().exec().then(function() {
      Device.remove().exec().then(function() {
        done();
      });
    });
  });

  it('should begin with no users', function(done) {
    User.find({role: 'user'}, function(err, users) {
      users.should.have.length(0);
      done();
    });
  });

  it('should fail when saving a duplicate user', function(done) {
    testdata.user[1].save(function() {
      var userDup = new User(testdata.user[1]);
      userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving with device id which does not exist in device table', function(done) {
    var userDup = new User(testdata.user[1]);
    userDup.devices = [{
      deviceId: '55d48443c5e6a9e3546cafbe'
    }];
    userDup.save(function(err, user) {
      should.exist(err);
      done();
    });
  });

  it('should fail when saving if active device is already in use', function(done) {
    new Device(testdata.device[1]).save(function(err, device) {
      var userDup1 = new User(testdata.user[1]);
      userDup1.devices = [{
        deviceId: device._id
      }];
      userDup1.save(function(err, user) {
        var userDup2 = new User(testdata.user[2]);
        userDup2.devices = userDup1.devices;
        userDup2.save(function(err, user) {
          should.exist(err);
          done();
        });
      });
    });
  });

  it('should save if active device is not already in use', function(done) {
    new Device(testdata.device[1]).save(function(err, device) {
      var userDup1 = new User(testdata.user[1]);
      userDup1.devices = [{
        deviceId: device._id,
        startedOn: new Date(new Date().setDate(new Date().getDate() - 1)),
        endedOn: new Date()
      }];
      userDup1.save(function(err, user) {
        var userDup2 = new User(testdata.user[2]);
        userDup2.devices = [{
          deviceId: device._id
        }];
        userDup2.save(function(err, user) {
          should.not.exist(err);
          user.should.have.property('_id');
          done();
        });
      });
    });
  });

  it('should save with valid device id', function(done) {
    new Device(testdata.device[1]).save(function(err, device) {
      var userDup = new User(testdata.user[1]);
      userDup.devices = [{
        deviceId: device._id
      }];
      userDup.save(function(err, user) {
        should.not.exist(err);
        done();
      });
    });
  });

  it('should fail when saving with startedOn property greater than endedOn property', function(done) {
    new Device(testdata.device[1]).save(function(err, device) {
      var userDup = new User(testdata.user[1]);
      userDup.devices = [{
        device: device._id,
        startedOn: moment().add(1, 'days').unix(),
        endedOn: moment().unix()
      }];
      userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

});
