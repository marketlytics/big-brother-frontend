'use strict';

angular.module('bigBrotherApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/devices', {
        templateUrl: 'app/device/device.html',
        controller: 'DeviceCtrl'
      });
  });