'use strict';

describe('Login', function() {

  beforeEach(function() {
    
  });

  it('should login with correct credentials', function() {
    browser.get('/login');
    element(by.model('user.email')).sendKeys('admin@admin.com');
    element(by.model('user.password')).sendKeys('admin');
    element(by.css('.btn-login')).click();
    expect(element(by.css('.navbar-right li:last-child')).getText()).toBe('Logout');
  });

  it('should show error when logging in with incorrect credentials', function() {
    browser.get('/login');
    element(by.model('user.email')).sendKeys('admin@admin.com');
    element(by.model('user.password')).sendKeys('adminnn');
    element(by.css('.btn-login')).click();
    expect(element.all(by.css('.has-error p:not(.ng-hide)')).isDisplayed()).toBeTruthy();
  });
});