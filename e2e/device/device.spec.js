'use strict';

describe('Device View', function() {
	var page = require('./device.po');
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
				page.get();
				done();
			});
		});

		it('should not show action buttons if admin is not logged in', function() {
      page.assertAdminFunctions(false);
    });

		it('should show device list', function() {
			page.assertDeviceCount(3);
		});
	});

	describe('Role - Admin: ', function() {
		
		beforeEach(function(done) {
			utils.resetDatabase(function() {
				login();
				page.get();
				done();
			});
		});

		afterEach(function() {
			element(by.cssContainingText('#navbar-main .navbar-right a', 'Logout')).click();
		});

		it('should show action buttons if admin is logged in', function() {
			page.assertAdminFunctions(true);
		});

		it('should add device', function() {
			page.addDevice(testdata.devices.deviceToAdd);
			page.assertDevice(testdata.devices.deviceToAdd);
		});

		it('should delete one device', function(done) {
			page.deleteDevices([testdata.devices[2]], function() {
				page.assertDeviceCount(2);
				done();
			});
		});

		it('should delete multiple devices', function(done) {
			page.addDevice(testdata.devices.deviceToAdd);
			page.deleteDevices([testdata.devices[2], testdata.devices.deviceToAdd], function() {
				page.assertDeviceCount(2);
				done();
			});
		});

		it('should not delete if device is currently associated with a user as active device', function(done) {
			page.deleteDevices([testdata.devices[0]], function() {
				page.assertError();
				done();
			});
		});

		it('should edit device', function() {
			var deviceDup = JSON.parse(JSON.stringify(testdata.devices[0]));
			deviceDup.name = 'test'
			deviceDup.mac = '02:02:02:02:02:02';
			page.editDevice(testdata.devices[0], deviceDup);
			page.assertFullDevice(deviceDup);
		});

		it('should show error if name is already present', function() {
			var deviceDup = JSON.parse(JSON.stringify(testdata.devices.deviceToAdd));
			deviceDup.name = testdata.devices[0].name;
			page.addDevice(deviceDup);
			page.assertError();
			page.closeModal();
		});

		it('should show error if mac address is already present', function() {
			var deviceDup = JSON.parse(JSON.stringify(testdata.devices.deviceToAdd));
			deviceDup.mac = testdata.devices[0].mac;
			page.addDevice(deviceDup);
			page.assertError();
			page.closeModal();
		});

		it('show show error if mac address is invalid', function() {
			var deviceDup = JSON.parse(JSON.stringify(testdata.devices.deviceToAdd));
			deviceDup.mac = '01-01-01-az-12:12';
			page.addDevice(deviceDup);
			page.assertError();
			page.closeModal();
		});

	});

});