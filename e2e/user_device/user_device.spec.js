'use strict';

describe('User Device History View', function() {
	var page = require('./user_device.po');
  var testdata = require('../testdata');
  var utils = require('../utils');

  var login = function() {
		browser.get('/login');
		element(by.model('user.email')).sendKeys(testdata.users[0].email);
		element(by.model('user.password')).sendKeys(testdata.users[0].password);
		element(by.css('.btn-login')).click();
		browser.waitForAngular();
	};

	describe('Role - User: ', function() {

		beforeEach(function(done) {
			utils.resetDatabase(function() {
				page.get(testdata.users[1]._id);
				done();
			});
		});

		it('should not show action buttons if admin is not logged in', function() {
			page.assertAdminFunctions(false);
		});

		it('should show device list', function() {
			page.assertUserDeviceCount(3);
		});

	});

	describe('Role - Admin: ', function() {

		beforeEach(function(done) {
			utils.resetDatabase(function() {
				login();
				page.get(testdata.users[1]._id);
				done();
			});
		});

		afterEach(function() {
			element(by.cssContainingText('#navbar-main .navbar-right a', 'Logout')).click();
		});

		it('should show action buttons if admin is logged in', function() {
			page.assertAdminFunctions(true);
		});

		it('should add new device in history', function() {
			var userDeviceCpy = JSON.parse(JSON.stringify(testdata.users[1].devices[0]));
			userDeviceCpy.startedOn = new Date().setDate(new Date().getDate() - 20);
			userDeviceCpy.endedOn = new Date().setDate(new Date().getDate() - 10);
			page.addUserDevice(userDeviceCpy);
			page.assertUserDevice(userDeviceCpy);
		});

		it('should show error new active device is added (without editing the current active device)', function() {
			var userDeviceCpy = JSON.parse(JSON.stringify(testdata.users[1].devices[0]));
			delete userDeviceCpy.endedOn;
			page.addUserDevice(userDeviceCpy);
			page.assertError();
			page.closeModal();
		});

		it('should show error if any of the device has a overlapping range', function() {
			var userDeviceCpy = JSON.parse(JSON.stringify(testdata.users[1].devices[0]));
			userDeviceCpy.startedOn = new Date().setDate(new Date().getDate() - 2);
			userDeviceCpy.endedOn = new Date();
			page.addUserDevice(userDeviceCpy);
			page.assertError();
			page.closeModal();
		});

		it('should show error if end date is greater than start date', function() {
			var userDeviceCpy = JSON.parse(JSON.stringify(testdata.users[1].devices[0]));
			userDeviceCpy.endedOn = new Date().setDate(new Date().getDate() - 20);
			page.addUserDevice(userDeviceCpy);
			page.assertError();
			page.closeModal();
		});

		it('should edit device', function() {
			var userDeviceCpy = JSON.parse(JSON.stringify(testdata.users[1].devices[0]));
			userDeviceCpy.deviceId = testdata.devices[1]._id;
			page.editUserDevice(testdata.users[1].devices[0], userDeviceCpy);
			page.assertUserDevice(userDeviceCpy);
		});

		it('should delete single device', function() {
			page.deleteUserDevices([testdata.users[1].devices[0]]);
			page.assertUserDeviceCount(2);
		});

		it('should delete multiple device', function() {
			page.deleteUserDevices([testdata.users[1].devices[0], testdata.users[1].devices[1]]);
			page.assertUserDeviceCount(1);
		});

	});

});