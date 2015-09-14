'use strict';

angular.module('bigBrotherApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/users/:id/history', {
        templateUrl: 'app/user/device/userdevice.html',
        controller: 'UserDeviceCtrl'
      });
  });