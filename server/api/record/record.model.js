'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecordSchema = new Schema({
    mac: { type: String, required: true, lowercase: true },
    lastUpdated: { type: Number, required: true },
    status: { type: String, required: true }
});

module.exports = mongoose.model('Record', RecordSchema);