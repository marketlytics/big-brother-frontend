'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var Device = require('../device/device.model');

var UserDevices = new Schema({
  deviceId: { type: Schema.ObjectId, ref: 'Device', required: true },
  startedOn: { type: Number, default: new Date().setHours(0,0,0) / 1000 },
  endedOn: { type: Number }
});

var UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  salt: String,
  leavesAllowed: Number,
  devices: { type: [UserDevices], default: [] },
  disabled: { type: Boolean, default: false }
});

/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified email address is already in use.');


var getUniqueDeviceIds = function(devices) {
  var deviceIds = [];
  devices.forEach(function(device) {
    if(deviceIds.indexOf(device.deviceId.toString()) < 0)
      deviceIds.push(device.deviceId.toString())
  });
  return deviceIds;
};

UserSchema
  .path('devices')
  .validate(function(devices) {
    var isValid = true;
    devices.forEach(function(device) {
      if(typeof device.endedOn !== 'undefined' && typeof device.startedOn !== 'undefined' && device.endedOn < device.startedOn)
        isValid = false;
    });
    return isValid;
  }, 'startedOn cannot be greater than endedOn');

UserSchema
  .path('devices')
  .validate(function(devices, respond) {
    if(devices.length === 0) {
      return respond(true);
    }
    var deviceIds = getUniqueDeviceIds(devices);
    Device.find({_id: {$in: deviceIds}}, function(err, devices) {
      if(err) throw err;
      if(devices.length !== deviceIds.length)
        return respond(false);
      respond(true);
    });
  }, 'Invalid device reference');

UserSchema
  .path('devices')
  .validate(function(devices, respond) {
    var activeDevice = devices.filter(function(device) {
      return typeof device.endedOn === 'undefined';
    });
    respond( !(activeDevice.length > 1) )
  }, 'A user cannot have two active devics at once');

UserSchema
  .path('devices')
  .validate(function(devices, respond) {
    var activeDevice = devices.filter(function(device) {
      return typeof device.endedOn === 'undefined';
    });

    if(activeDevice.length === 1) {
      activeDevice = activeDevice[0];
      mongoose.model('User').findOne({'devices': {$elemMatch: { $and : [{deviceId: activeDevice.deviceId}, {endedOn: {$exists: false}}]}}, '_id': { $ne: this._id}}, function(err, device) {
        if(err) throw err;
        if(device) {
          return respond(false);
        }
        respond(true);
      });
    } else {
      respond(true);
    }
  }, 'Device already in use');

UserSchema
  .path('devices')
  .validate(function(devices, respond) {
    
    var _this = this;

    var checkOverlap = function(deviceId, startedOn, endedOn, callback) {
      var query = {
        $and: [
          {
            _id: {$ne: _this._id}
          },
          {
            devices: {
              $elemMatch: {
                deviceId: deviceId,
                $or: [
                  {startedOn: {$gt: startedOn}}, 
                  {endedOn: {$gt: startedOn}}
                ]
              }
            }
          }
        ]
      };
      if(endedOn !== null) {
        query.$and[1].devices.$elemMatch.$or[0].startedOn.$lt = endedOn;
        query.$and[1].devices.$elemMatch.$or[1].endedOn.$lt = endedOn;
      }
      mongoose.model('User').find(query, callback);
    };

    var traverse = function(devices, callback) {
      if(devices.length === 0) {
        callback(true);
        return;
      }
      checkOverlap(
        devices[0].deviceId, 
        devices[0].startedOn, 
        typeof devices[0].endedOn !== 'undefined' ? devices[0].endedOn : null,
        function(err, users) {
          if(err || users.length) callback(false);
          else traverse(devices.slice(1), callback);
        }
      );
    };
    
    //check if devices within a user's history donot overlap
    var devicesCpy = devices.map(function(device) {
      var deviceCpy = {
        deviceId: device.deviceId,
        startedOn: device.startedOn
      };
      if(device.endedOn !== 'undefined') {
        deviceCpy.endedOn = device.endedOn;
      }
      removeTime([deviceCpy]);
      return deviceCpy;
    });
    devicesCpy.sort(function(a,b) {
      return a.startedOn - b.startedOn;
    });
    for(var i = 1; i < devicesCpy.length; i++) {
      if(typeof devicesCpy[i-1].endedOn === 'undefined') {
        respond(false);
        return;
      } else if(devicesCpy[i].startedOn < devicesCpy[i-1].endedOn) {
        respond(false);
        return;
      }
    }

    //validate if a certain device in user's history is not held by another user in overlapping time range.
    traverse(devicesCpy, respond);

  }, 'Make sure ranges are not overlapped');

var validatePresenceOf = function(value) {
  return value && value.length;
};

function removeTime(userDevices) {
  userDevices.forEach(function(userDevice) {
    userDevice.startedOn = new Date(userDevice.startedOn * 1000).setHours(0,0,0,0) / 1000;
    if(typeof userDevice.endedOn !== 'undefined') {
      userDevice.endedOn = new Date(userDevice.endedOn * 1000).setHours(0,0,0,0) / 1000;
    }
  });
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (this.role === 'admin' && !validatePresenceOf(this.hashedPassword))
      next(new Error('Invalid password'));
    else if (this.role === 'user' && validatePresenceOf(this.hashedPassword))
      next(new Error('Password cannot be set for users'));
    else {
      removeTime(this.devices);
      next();
    }
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
