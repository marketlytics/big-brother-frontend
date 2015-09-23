'use strict';

var DevicePage = function() {

	var fillForm = function(device) {
		browser.wait(function() {
			return element(by.css('.modal-footer .btn-primary')).isPresent();
		}, 1000);
		if(typeof device.name !== 'undefined') {
			element(by.model('device.name')).clear().sendKeys(device.name);
		}

		if(typeof device.mac !== 'undefined') {
			element(by.model('device.mac')).clear().sendKeys(device.mac);
		}

		if(typeof device.description !== 'undefined') {
			element(by.model('device.description')).clear().sendKeys(device.description);
		}

		element(by.css('.modal-footer .btn-primary')).click();
	};

	this.get = function() {
		browser.get('/devices');
	};

	this.assertAdminFunctions = function(shouldPresent) {
		expect(element(by.css('.action-wrapper')).isPresent()).toBe(shouldPresent);
		expect(element(by.css('.mdi-image-edit')).isPresent()).toBe(shouldPresent);
	};

	this.assertDeviceCount = function(count) {
		expect(element.all(by.css('.list-group-item')).count()).toBe(count);
	};

	this.addDevice = function(device) {
		element(by.css('.action-wrapper .mdi-content-add')).click();
		fillForm(device);
	};

	this.assertDevice = function(device) {
		browser.wait(function() {
			return element(by.css('.modal-dialog')).isPresent().then(function(isPresent) {
				return !isPresent;
			});
		});
		expect(element(by.cssContainingText('.list-group-item', device.mac)).isPresent()).toBeTruthy();
	};

	this.assertFullDevice = function(device) {
		this.assertDevice(device);
		var container = element(by.cssContainingText('.list-group-item', device.mac));
		expect(container.element(by.css('.list-group-item-heading')).getText()).toContain(device.name);
		expect(container.element(by.cssContainingText('.list-group-item-text', device.mac)).isPresent()).toBeTruthy();
		if(typeof device.description !== 'undefined') {
			expect(container.element(by.cssContainingText('.list-group-item-text', device.description)).isPresent()).toBeTruthy();
		}
	}

	this.deleteDevices = function(devices, callback) {
		devices.forEach(function(device) {
			var container = element(by.cssContainingText('.list-group-item', device.mac));
			container.element(by.css('.check')).click();
		});
		element(by.css('.action-wrapper .mdi-action-delete')).click().then(callback);
	};

	this.editDevice = function(originalDevice, editedDevice) {
		var container = element(by.cssContainingText('.list-group-item', originalDevice.mac));
		container.element(by.css('.mdi-image-edit')).click();
		fillForm(editedDevice);
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
	};
};

module.exports = new DevicePage();