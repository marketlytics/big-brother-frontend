/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Device = require('../api/device/device.model');
var Record = require('../api/record/record.model');
var moment = require('moment');

var devices = [
  new Device({
    name: 'mac01',
    mac: '10:93:e9:5e:f5:92',
    createdOn: new Date(),
    description: 'AQ - i5 2011 - 4GB'
  }), 
  new Device({
    name: 'mac02',
    mac: 'e3:91:21:54:97:f5',
    createdOn: new Date(),
    description: 'Shamroze - i3 2011 - 8GB'
  }),
  new Device({
    name: 'mac03',
    mac: 'f4:91:21:54:97:52',
    createdOn: new Date(),
    description: 'Shamroze - i3 2011 - 8GB'
  }),
  new Device({
    name: 'mac04',
    mac: 'd3:91:21:54:97:53',
    createdOn: new Date(),
    description: 'Shamroze - i3 2011 - 8GB'
  })
];

var users = [
  new User({
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }), 
  new User({
    name: 'Abdul Qadir',
    email: 'abdulqadir@marketlytics.com',
    devices: [{
      deviceId: devices[0]._id,
      startedOn: new Date(new Date().setDate(new Date().getDate() - 30)),
      endedOn: new Date(new Date().setDate(new Date().getDate() - 15))
    }, {
      deviceId: devices[1]._id,
      startedOn: new Date(new Date().setDate(new Date().getDate() - 15)),
      endedOn: new Date(new Date().setDate(new Date().getDate() - 5))
    }, {
      deviceId: devices[2]._id,
      startedOn: new Date(new Date().setDate(new Date().getDate() - 5))
    }]
  }),
  new User({
    name: 'Mashhood Rastgar',
    email: 'mashhoodr@gmail.com',
    devices: [{
      deviceId: devices[0]._id,
      startedOn: new Date(new Date().setDate(new Date().getDate() - 15)),
      endedOn: new Date(new Date().setDate(new Date().getDate() - 5))
    }, {
      deviceId: devices[1]._id,
      startedOn: new Date(new Date().setDate(new Date().getDate() - 30)),
      endedOn: new Date(new Date().setDate(new Date().getDate() - 15))
    }, {
      deviceId: devices[3]._id,
      startedOn: new Date(new Date().setDate(new Date().getDate() - 5))
    }]
  })
];

//enter devices first
Device.find({}).remove(function() {
  Device.create(devices, function(err) {
    if(err) { console.error(err); }
    console.log('finished populating devices');
    //then enter users
    User.find({}).remove(function() {
      User.create(users, function(err) {
        if(err) { console.error(err); }
        console.log('finished populating users');
      });
    });
  });
});

function generateRandomInt(min, max) {
  return Math.random() * (max - min) + min;
}

var getRecords = function(mac, from, to) {
  var records = [];
  do {
    var randomTime = [];
    for(var i = 0; i < 10; i++) {
      var randomInt = 0;
      var length = 0;
      do {
        randomInt = generateRandomInt(from.clone().hour(8), from.clone().hour(23));
        length = randomTime.filter(function(timestamp) {
          return timestamp === randomInt;
        }).length;
      } while (length > 0);
      randomTime.push(randomInt);
    }
    randomTime.sort();
    randomTime.forEach(function(timestamp, index) {
      records.push({
        mac: mac,
        lastUpdated: timestamp,
        status: index % 2 === 0 ? 'UP' : 'DOWN'
      })
    });
    from.add(1, 'days');
  } while(to.diff(from, 'days') > 0);
  return records;
};

Record.find({}).remove(function() {
  var records = [];
  devices.forEach(function(device) {
    records = records.concat(getRecords(device.mac, moment().subtract(30, 'days'), moment()));
  });
  Record.create(records, function(err) {
    if(err) { console.error(err); }
    console.log('finished populating records');
  })
});