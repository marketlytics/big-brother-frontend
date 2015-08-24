/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Device = require('../api/device/device.model');
var Record = require('../api/record/record.model');

User.find({}).remove(function() {
  User.create({
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, {
    name: 'Abdul Qadir',
    email: 'abdulqadir@marketlytics.com'
  }, {
    name: 'Mashhood Rastgar',
    email: 'mashhoodr@gmail.com'
  }, function(err) {
      if(err) { console.error(err); }
      console.log('finished populating users');
    }
  );
});

Record.find({}).remove(function() {
  Record.create({
    mac: '10:93:e9:5e:f5:92',
    lastUpdated: (new Date()).getTime() - 10000,
    status: 'UP'
  },
  {
    mac: '10:93:e9:5e:f5:92',
    lastUpdated: (new Date()).getTime(),
    status: 'DOWN'
  },
  {
    mac: '10:96:e9:5e:f5:92',
    lastUpdated: (new Date()).getTime() - 30000,
    status: 'UP'
  },
  {
    mac: '10:96:e9:5e:f5:92',
    lastUpdated: (new Date()).getTime(),
    status: 'DOWN'
  }, function(err) {
    if(err) { console.error(err); }
    console.log('finished populating records');
  });
});

Device.find({}).remove(function() {
  Device.create({
    mac: '10:93:e9:5e:f5:92',
    createdOn: new Date(),
    description: 'AQ - i5 2011 - 4GB'
  }, {
    mac: 'e3:91:21:54:97:f5',
    createdOn: new Date(),
    description: 'Shamroze - i3 2011 - 8GB'
  }, function(err) {
    if(err) { console.error(err); }
    console.log('finished populating devices');
  });
});