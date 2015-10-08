'use strict';

var Record = require('./record.model');
var Device = require('../device/device.model');
var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var fs = require('fs');

var getFilteredQuery = function(queryObj, callback) {
	var args = {};
	if(typeof queryObj.filter === 'undefined') return callback(null, {});
	var tokens = queryObj.filter.split(',');
	if(tokens.length === 0) return callback(null, {});
	tokens.forEach(function(token) {
		args[token.split(':')[0]] = token.split(':')[1];
	});

	var query = {};
	if(typeof args.start !== 'undefined' || typeof args.end !== 'undefined') {
		query.lastUpdated = {};
		if(typeof args.start !== 'undefined') {
			query.lastUpdated.$gte = parseFloat(args.start);
		}
		if(typeof args.end !== 'undefined') {
			query.lastUpdated.$lte = parseFloat(args.end);
		}
	}
	if(typeof args.device !== 'undefined') {
		Device.findById(args.device, function(err, device) {
			if(err) return callback(err, null);
			if(!device) return ({err: 'device not found'}, null);
			query.mac = device.mac;
			callback(null, query);
		});
	} else {
		callback(null, query);
	}
};

var getIncludes = function(queryObj, records, callback) {
	var tokens = typeof queryObj.include !== 'undefined' ? queryObj.include.split(',') : [];

	if(tokens.length === 0) {
		return callback({
			results: records
		});
	}

	User.find({}, function(err, users) {
		Device.find({}, function(err, devices) {
			var ret = {
				includes: {},
				results: []
			};

			if(tokens.indexOf('users') >= 0) ret.includes.users = {};
			if(tokens.indexOf('devices') >= 0) ret.includes.devices = {};

			//append mac addresses to user devices array
			var usersCpy = users.map(function(user) { 
				var userCpy = user.toObject(); //convert mongoose object to json
				userCpy.devices.forEach(function(userDevice) {
					userDevice.mac = devices.filter(function(device) {
						return device._id.toString() === userDevice.deviceId.toString();
					})[0].mac;
				});
				return userCpy;
			});

			var devicesCpy = devices.map(function(device) {
				return device.toObject();
			});
				
			records.forEach(function(record) {
				var recordCpy = record.toObject();

				/*
				 * check every user's device history 
				 * find if there's a device having the same mac address as the record
				 * if a user has the device with the same mac address in his history of devices
				 * then check if record's time lies between the range of the time user owned that device
				 * append the user id to the record if all the conditions are true
				 */
				if(tokens.indexOf('users') >= 0) {
					var user = usersCpy.filter(function(user) {
						return user.devices.filter(function(userDevice) {
							var ret = userDevice.mac === record.mac && record.lastUpdated >= userDevice.startedOn.getTime();
							if(typeof userDevice.endedOn !== 'undefined') {
								ret = ret && record.lastUpdated <= userDevice.endedOn.getTime();
							}
							return ret;
						}).length;
					})[0];
					if(typeof user !== 'undefined') {
						ret.includes.users[user._id] = user;
						recordCpy.user = user._id;
					}
				}

				if(tokens.indexOf('devices') >= 0) {
					var device = devicesCpy.filter(function(device) {
						return device.mac === record.mac
					})[0];
					if(typeof device !== 'undefined') {
						ret.includes.devices[device._id] = device;
						recordCpy.device = device._id;
					}
				}

				ret.results.push(recordCpy);
			});

			callback(ret);
		}); 
	});
};

exports.index = function(req, res) {
	getFilteredQuery(req.query, function(err, query) {
		if(err) return res.status(500).send(err);
		Record.find(query, function(err, records) {
			if(err) return res.status(500).send(err);
			//append corresponding user id and device id to each record
			getIncludes(req.query, records, function(records) {
				res.status(200).json(records);
			});
		});
	});
};

exports.saveRecords = function(req, res) {
	if(typeof req.body.data !== 'undefined') {
		var messages = JSON.parse(req.body.data);
		var records = [];
		for(var i = 0; i < messages.length; i++)
		{
			var message = messages[i]
			if(typeof message.type !== 'undefined' && message.type === 'node')
			{
				for(var j = 0; j < message.nodes.length; j++)
				{
					var node = message.nodes[j];
					records.push({
						mac: node.mac_addr,
						lastUpdated: message.created,
						status: (node.node_status === 0 ? 'DOWN' : 'UP')
					});
				}
			}
		}
		if(records.length > 0)
		{
			Record.create(records, function(err) {
				res.send(200);
			});
		}
		else res.send(200);
	}
};

exports.saveLogs = function(req, res) {
	if(typeof req.file !== "undefined" && req.file.fieldname === 'log') {
		var newPath = 'logs/' + req.file.originalname;
		fs.createReadStream(req.file.path).pipe(fs.createWriteStream(newPath, {'flags': 'a'}));
	}
	return res.status(200).end();
};