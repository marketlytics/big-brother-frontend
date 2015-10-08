'use strict';

var express = require('express');
var controller = require('./record.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.saveRecords);
router.post('/log', controller.saveLogs);

module.exports = router;