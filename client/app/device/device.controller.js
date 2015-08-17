'use strict';

angular.module('bigBrotherApp')
  .controller('DeviceCtrl', function ($scope, Auth, Device, $http, $timeout) {
      Device.getList(function(devices) {
      	$timeout(function() {
      		$scope.devices = devices;
      	}, 500);
      });
  });