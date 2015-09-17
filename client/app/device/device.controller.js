'use strict';

angular.module('bigBrotherApp')
	.controller('DeviceCtrl', function ($scope, Auth, Device, $timeout, $modal) {
		
		var getDeviceList = function() {
			var deviceList = Device.getList();

			deviceList.$promise.then(function(devices) {
				$timeout(function() {
					$scope.originalDevices = devices;
					$scope.devices = angular.copy(devices).filter(function(device) {
							return !device.disabled;
					});

					var columnCount = 3;
					$scope.rows = [];

					for(var i = 0; i < Math.ceil($scope.devices.length / columnCount); i++) {
						$scope.rows[i] = [];
					}

					for(var j = 0; j < $scope.devices.length; j++) {
						$scope.devices[j].checked = false;
						$scope.rows[Math.floor(j/columnCount)].push($scope.devices[j]);
					}
				});
			});
			
			return deviceList;	
		};

		var deviceList = getDeviceList();

		$scope.isLoggedIn = Auth.isLoggedIn;

		$scope.openDeviceModal = function(device) {
			var modalInstance = $modal.open({
				templateUrl: 'deviceForm.html',
				animation: true,
				controller: 'DeviceModalInstanceCtrl',
				resolve: {
					devices: function() {
						return deviceList;
					},
					device: function() {
						if(device === null) {
							return null;
						}
						return $scope.originalDevices.filter(function(originalDevice) {
							return originalDevice._id === device._id;
						})[0];
					}
				}
			});

			modalInstance.result.then(function(msg) {
    		//TODO: show success message
    		deviceList = getDeviceList();
    	});
		};

		$scope.onToggle = function(device) {
			device.checked = !device.checked;
		};

		$scope.onDelete = function() {
			var devices = $scope.devices.filter(function(device) {
				return device.checked;
			});
			var length = devices.length;
			devices.forEach(function(device) {
				Device.deleteDevice({
					id: device._id
				}, function(data) {
					if(--length === 0) {
						deviceList = getDeviceList();
					}
				}, function(err) {
					//handle error
					console.log(err);
					if(--length === 0) {
						deviceList = getDeviceList();
					}
				});
			});
		};

	});


angular.module('bigBrotherApp')
  .controller('DeviceModalInstanceCtrl', function ($scope, $timeout, Utils, $modalInstance, Device, devices, device) {
		
	$scope.errors = [];
	$scope.device = {
		name: device !== null ? device.name : '',
		mac: device !== null ? device.mac : '',
		description: device !== null ? device.description : ''
	};

  	$scope.ok = function() {
  		if(device === null) {
			Device.addDevice({}, 
			$scope.device,
			function(data) {
				$modalInstance.close('');
			},
			function(err) {
				handleErrors(err);
			});
		} else {
			var newDevice = angular.copy(device);
			delete newDevice._id;
			delete newDevice.__v;
			newDevice.name = $scope.device.name;
			newDevice.mac = $scope.device.mac;
			newDevice.description = $scope.device.description;
			Device.editDevice({
				id: device._id
			}, newDevice, 
			function(data) {
				$modalInstance.close('');
			}, function(err) {
				$timeout(function() {
					$scope.errors = Utils.getErrMessages(err);
				}, 0);
			});
		}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
  });