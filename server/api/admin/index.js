'use strict';

var express = require('express');
var controller = require('./admin.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/me', auth.hasRole('admin'), controller.me);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.put('/password', auth.hasRole('admin'), controller.changePassword);
router.post('/', auth.hasRole('admin'), controller.create);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;