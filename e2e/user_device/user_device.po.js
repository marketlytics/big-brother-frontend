'use strict';

var moment = require('moment'),
	testdata = require('../testdata');

var UserDevicePage = function() {
	var getDeviceName = function(userDevice) {
		var name = '';
		for(var id in testdata.devices) {
			if(testdata.devices[id]._id.toString() === userDevice.deviceId) {
				name = testdata.devices[id].name;
			}
		}
		return name;
	};

	var fillForm = function(userDevice) {
		browser.wait(function() {
			return element(by.css('.modal-footer .btn-primary')).isPresent();
		}, 1000);
		if(typeof userDevice.deviceId !== 'undefined') {
			var selectBox = element(by.model('userDevice.deviceId'));
			selectBox.click();
			var deviceName = getDeviceName(userDevice);
			selectBox.element(by.cssContainingText('option', deviceName)).click();
		}

		if(typeof userDevice.startedOn !== 'undefined') {
			element(by.model('userDevice.startedOn')).clear().sendKeys(moment.utc(userDevice.startedOn, 'X').format('MMM DD, YYYY'));
		}

		if(typeof userDevice.endedOn !== 'undefined') {
			element(by.model('userDevice.endedOn')).clear().sendKeys(moment.utc(userDevice.endedOn, 'X').format('MMM DD, YYYY'));
		}
		
		element(by.css('.modal-footer .btn-primary')).click();
		
	};

	this.get = function(userId) {
		browser.get('/users/' + userId + '/history');
	};

	this.assertAdminFunctions = function(shouldPresent) {
		expect(element(by.css('.action-wrapper')).isPresent()).toBe(shouldPresent);
		expect(element(by.css('.mdi-image-edit')).isPresent()).toBe(shouldPresent);
	};

	this.assertUserDeviceCount = function(count) {
		expect(element.all(by.css('tbody tr')).count()).toBe(count);
	};

	this.editUserDevice = function(userDevice, editedUserDevice) {
		element(by.css('[data-id="'+userDevice._id+'"] .mdi-image-edit')).click();
		fillForm(editedUserDevice);
	};

	this.addUserDevice = function(userDevice) {
		element(by.css('.action-wrapper .mdi-content-add')).click();
		fillForm(userDevice);
	};

	this.deleteUserDevices = function(userDevices) {
		var length = userDevices.length;
		userDevices.forEach(function(userDevice) {
			element(by.css('[data-id="'+userDevice._id+'"] .check')).click();
		});
		element(by.css('.action-wrapper .mdi-action-delete')).click();
	}

	this.assertUserDevice = function(userDevice) {
		browser.wait(function() {
			return element(by.css('.modal-dialog')).isPresent().then(function(isPresent) {
				return !isPresent;
			});
		});
		expect(element(by.css('[data-id="'+userDevice._id+'"]')).isPresent()).toBeTruthy();
	};

	this.assertError = function() {
		expect(element(by.css('.alert.alert-danger')).isPresent()).toBeTruthy();
	};

	this.closeModal = function() {
		element(by.css('.modal-dialog')).isPresent().then(function(isPresent) {
			if(isPresent) {
				element(by.css('.btn.btn-warning')).click();
			}
		});
		browser.wait(function() {
			return element(by.css('.modal-dialog')).isPresent().then(function(isPresent) {
				return !isPresent;
			});
		});
	};
};

module.exports = new UserDevicePage();