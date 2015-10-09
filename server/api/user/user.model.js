'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var Device = require('../device/device.model');

var UserDevices = new Schema({
  deviceId: { type: Schema.ObjectId, ref: 'Device', required: true },
  startedOn: { type: Number, default: new Date().getTime() / 1000 },
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
  .validate(function(devices) {
    var filteredDevices = devices.filter(function(userDevice) {
      return typeof userDevice.startedOn !== 'undefined' && typeof userDevice.endedOn !== 'undefined';
    });
    filteredDevices.sort(function(a, b) {
      return a.startedOn - b.startedOn;
    });
    for(var i = 0; i < filteredDevices.length - 1; i++)
    {
      if(filteredDevices[i+1].startedOn < filteredDevices[i].endedOn) {
        return false;
      }
    }
    return true;
  }, 'Make sure ranges are not overlapped');

var validatePresenceOf = function(value) {
  return value && value.length;
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
    else 
      next();
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
