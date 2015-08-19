'use strict';

var should = require('should');
var app = require('../../app');
var User = require('./user.model');
var Device = require('../device/device.model');

var user = new User({
  name: 'Fake User',
  email: 'test@test.com'
});

var user2 = new User({
  name: 'Fake User 2',
  email: 'test2@test.com'
});

var device = new Device({
  mac: '01:01:01:01:01:01',
  createdOn: new Date()
});

describe('User Model', function() {
  before(function(done) {
    User.remove().exec().then(function() {
      Device.remove().exec().then(function() {
        done();
      });
    });

  });

  afterEach(function(done) {
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
    user.save(function() {
      var userDup = new User(user);
      userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving with invalid device id', function(done) {
    var userDup = new User(user);
    userDup.devices = [{
      deviceId: 'abcd12345'
    }];
    userDup.save(function(err, user) {
      should.exist(err);
      done();
    });
  });

  it('should fail when saving with device id which does not exist in device table', function(done) {
    var userDup = new User(user);
    userDup.devices = [{
      deviceId: '55d48443c5e6a9e3546cafbe'
    }];
    userDup.save(function(err, user) {
      should.exist(err);
      done();
    });
  });

  it('should fail when saving if active device is already in use', function(done) {
    device.save(function(err, device) {
      var userDup1 = new User(user);
      userDup1.devices = [{
        deviceId: device._id
      }];
      userDup1.save(function(err, user) {
        var userDup2 = new User(user2);
        userDup2.devices = userDup1.devices;
        userDup2.save(function(err, user) {
          should.exist(err);
          done();
        });
      });
    });
  });

  it('should save if active device is not already in use', function(done) {
    device.save(function(err, device) {
      var userDup1 = new User(user);
      userDup1.devices = [{
        deviceId: device._id,
        startedOn: new Date(new Date().setDate(new Date().getDate() - 1)),
        endedOn: new Date()
      }];
      userDup1.save(function(err, user) {
        var userDup2 = new User(user2);
        userDup2.devices = [{
          deviceId: device._id
        }];
        userDup2.save(function(err, user) {
          should.exist(err);
          done();
        });
      });
    });
  });

  it('should save with valid device id', function(done) {
    var deviceDup = new Device(device); //fix - "VersionError: No matching document found".
    deviceDup.save(function(err, device) {
      var userDup = new User(user);
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
    var deviceDup = new Device(device);
    deviceDup.save(function(err, device) {
      var userDup = new User(user);
      userDup.devices = [{
        device: device._id,
        startedOn: new Date(new Date().setDate(new Date().getDate() + 1)),
        endedOn: new Date()
      }];
      userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

});
