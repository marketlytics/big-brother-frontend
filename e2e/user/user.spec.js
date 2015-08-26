'use strict';

describe('User View', function() {
  var page = require('./user.po');
  var testdata = require('../testdata');
  var utils = require('../utils');

  var login = function() {
    browser.get('/login');
    element(by.model('user.email')).sendKeys(testdata.users[0].email);
    element(by.model('user.password')).sendKeys(testdata.users[0].password);
    element(by.css('.btn-login')).click();
    browser.waitForAngular();
  }

  describe('Role - User', function() {
    beforeEach(function(done) {
      utils.resetDatabase(function() {
        page.get();
        done();  
      });
    });

    it('should not show action buttons if admin is not logged in', function() {
      page.assertAdminFunctions(false);
    });
  });

  describe('Role - Admin', function() {
    beforeEach(function(done) {
      utils.resetDatabase(function() {
        login();
        page.get();
        done();
      });
    });

    it('should show action buttons if admin is logged in', function() {
      page.assertAdminFunctions(true);
    });

    it('should add user', function() {
      page.addUser(testdata.users.userToAdd);
      page.assertUser(testdata.users.userToAdd, testdata.devices[2].mac);
    });

    it('should delete one user', function() {
      page.deleteUser(testdata.users[1]);
      page.assertUserCount(1);
    });

    it('should delete multiple users', function() {
      page.deleteUser(testdata.users[1]);
      page.deleteUser(testdata.users[2]);
      page.assertUserCount(0);
    });

    it('should edit user', function() {
      var userCpy = JSON.parse(JSON.stringify(testdata.users[1]));
      userCpy.email = 'email@edited.com';
      userCpy.name = 'Edited';
      userCpy.leavesAllowed = 15;
      page.editUser(testdata.users[1], userCpy);
      page.assertUserFull(userCpy, testdata.devices[0].mac);
    });

    it('should edit user device', function() {
      page.editUser(testdata.users[1], testdata.users[1], testdata.devices[2].mac);
      page.assertUserFull(testdata.users[1], testdata.devices[2].mac);
    });

    it('should show error if name is not entered', function() {
      var userCpy = JSON.parse(JSON.stringify(testdata.users.userToAdd));
      delete userCpy.name;
      page.addUser(userCpy);
      page.assertError();
    });

    it('should show error if email is not entered', function() {
      var userCpy = JSON.parse(JSON.stringify(testdata.users.userToAdd));
      delete userCpy.email;
      page.addUser(userCpy);
      page.assertError();
    });

    it('should show error if device is already selected', function() {
      var userCpy = JSON.parse(JSON.stringify(testdata.users.userToAdd));
      page.addUser(userCpy, testdata.devices[0].mac);
      page.assertError();
    });

  });
});