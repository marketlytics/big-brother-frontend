'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
	mac: { type: String, required: true, lowercase: true },
	createdOn: { type: Date, required: true },
	description: { type: String, maxLength: 300, trim: true },
	disabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('Device', DeviceSchema);
