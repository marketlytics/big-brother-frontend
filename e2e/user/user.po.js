'use strict';

var UserPage = function () {
	var fillForm = function(user, mac) {
		browser.wait(function() {
			return element(by.css('.modal-footer .btn-primary')).isPresent();
		}, 1000);
		
		if(typeof user.name !== 'undefined') {
			element(by.model('name')).clear().sendKeys(user.name);
		}

		if(typeof user.email !== 'undefined') {
			element(by.model('email')).clear().sendKeys(user.email);
		}

		if(typeof mac !== 'undefined') {
			var selectBox = element(by.model('device'));
			selectBox.click();
			selectBox.element(by.cssContainingText('option', mac)).click();
		}
		
		if(typeof user.leavesAllowed !== 'undefined') {
			element(by.model('leavesAllowed')).clear().sendKeys(user.leavesAllowed);
		}

		element(by.css('.modal-footer .btn-primary')).click();
	};

	this.get = function() {
		browser.get('/users');
	};

	this.assertAdminFunctions = function(shouldPresent) {
		expect(element(by.css('.action-wrapper')).isPresent()).toBe(shouldPresent);
		expect(element(by.css('.mdi-image-edit')).isPresent()).toBe(shouldPresent);
	};

	this.addUser = function(user, mac) {
		element(by.css('.action-wrapper .mdi-content-add')).click();
		fillForm(user, mac);
	};

	this.editUser = function(originalUser, editedUser, mac) {
		var container = element(by.cssContainingText('.user', originalUser.email));
		container.element(by.css('.mdi-image-edit')).click();
		fillForm(editedUser, mac);
	};

	this.assertUser = function(user) {
		browser.wait(function() {
			return element(by.css('.modal-dialog')).isPresent().then(function(isPresent) {
				return !isPresent;
			});
		});
		expect(element(by.cssContainingText('.user',user.email)).isPresent()).toBeTruthy();
	};

	this.assertUserFull = function(user, mac) {
		this.assertUser(user);
		var container = element(by.cssContainingText('.user', user.email));
		container.all(by.css('.info-item')).then(function(infoItem) {
			var macAddr = typeof mac !== 'undefined' ? mac : 'N/A';
			expect(infoItem[2].getText()).toContain(macAddr);
			var leaves = typeof user.leavesAllowed !== 'undefined' ? user.leavesAllowed : 'N/A';
			expect(infoItem[4].getText()).toBe(leaves.toString());
		});
	};

	this.deleteUser = function(user) {
		var container = element(by.cssContainingText('.user', user.email));
		container.element(by.css('.check')).click();
		element(by.css('.action-wrapper .mdi-action-delete')).click();
	};

	this.assertUserCount = function(count) {
		expect(element.all(by.css('.user')).count()).toBe(count);
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

module.exports = new UserPage();