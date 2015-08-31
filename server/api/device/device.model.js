'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
	name: { type: String, required: true},
	mac: { type: String, required: true, lowercase: true },
	createdOn: { type: Date, default: new Date() },
	description: { type: String, maxLength: 300, trim: true },
	disabled: { type: Boolean, default: false }
});

DeviceSchema
	.path('name')
	.validate(function(name) {
		return name.length;
	}, 'Name cannot be blank');

DeviceSchema
	.path('name')
	.validate(function(name, respond) {
		var self = this;
		mongoose.model('Device').findOne({_id: {$ne: self._id}, name: name}, function(err, device) {
			if(err) throw err;
			if(device) respond(false);
			else respond(true);
		});
	}, 'Name is already taken');

DeviceSchema
	.path('mac')
	.validate(function(mac) {
		return mac.length;
	}, 'Mac address cannot be blank');

DeviceSchema
	.path('mac')
	.validate(function(mac) {
		return new RegExp('^([0-9A-F]{2}:){5}([0-9A-F]{2})$', 'i').test(mac);
	}, 'Invalid mac address');

DeviceSchema
	.path('mac')
	.validate(function(mac, respond) {
		var self = this;
		mongoose.model('Device').findOne({_id: {$ne: self._id}, mac: mac}, function(err, device) {
			if(err) throw err;
			if(device) respond(false);
			else respond(true);
		});
	}, 'Device with specified mac already exists');

module.exports = mongoose.model('Device', DeviceSchema);
