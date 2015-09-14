'use strict';

angular.module('bigBrotherApp')
  .controller('UserListCtrl', function ($scope, Auth, User, Device, $http, $timeout, $modal) {
  	  $scope.users = [];
  	  var deviceList = Device.getList();

      var getUserList = function() {
	  	User.getList(function(data) {
			$timeout(function() {
				$scope.originalUsersArr = data;
				$scope.users = angular.copy(data);
				$scope.users.forEach(function(user) {
					user.checked = false;
					user.device = '';
					var userDevice = user.devices.filter(function(device) {
						return typeof device.endedOn === 'undefined';
					})[0];

					if(userDevice) {
						deviceList.$promise.then(function(devices) {
							var device = devices.filter(function(device) {
								return device._id === userDevice.deviceId;
							})[0];
							if(device) {
								user.device = device;
							}
						});
					}
				});
			}, 100);
		});
	  };

	  getUserList();

      $scope.openUserModal = function(user) {
      	var modalInstance = $modal.open({
      		templateUrl: 'userForm.html',
      		animation: true,
      		controller: 'UserModalInstanceCtrl',
      		resolve: {
      			devices: function() {
      				return deviceList;
      			},
      			user: function() {
      				if(user === null) {
      					return null;
      				}
      				return $scope.originalUsersArr.filter(function(originalUser) {
      					return originalUser._id === user._id;
      				})[0];
      			}
      		}
      	});

      	modalInstance.result.then(function(msg) {
      		//TODO: show success message
      		getUserList();
      	});
      };

      $scope.onToggle = function(user) {
      	var foundUser = $scope.users.filter(function(scopeUser) {
      		return scopeUser._id === user._id
      	})[0];
      	foundUser.checked = !foundUser.checked;
      };

      $scope.getCheckedCount = function() {
      	return $scope.users.filter(function(user) {
      		return user.checked;
      	}).length;
      };

      $scope.onDelete = function() {
      	var usersToRemove = $scope.users.filter(function(user) {
      		return user.checked;
      	});
      	var length = usersToRemove.length;
      	usersToRemove.forEach(function(user) {
      		User.deleteUser({
      			id: user._id
      		}, function(data) {
      			if(--length === 0) {
      				console.log('users were deleted successfully!');
      				getUserList();
      			}
      		}, function(err) {
      			//TODO: error handling
      			console.log(err);
      		});
      	});
      };

      $scope.isLoggedIn = Auth.isLoggedIn;
  });

angular.module('bigBrotherApp')
  .controller('UserModalInstanceCtrl', function ($scope, $timeout, User, $modalInstance, devices, user) {
  	
  	$scope.devices = devices;
  	$scope.user = user;
  	$scope.errors = [];
  	
  	if(user !== null) {
  		$scope.name = user.name;
		$scope.email = user.email;
		if(user.devices.length > 0) {
			devices.$promise.then(function(devices) {
				$timeout(function() {
					$scope.device = devices.filter(function(device) {
						return device._id === user.devices.filter(function(device) {
							return typeof device.endedOn === 'undefined';
						})[0].deviceId;
					})[0];
				}, 100);
			});
		}
		$scope.leavesAllowed = user.leavesAllowed;
  	}

  	$scope.handleErrors = function(err) {
  		$scope.errors = [];
  		if(typeof err.data !== 'undefined' && err.data.errors !== 'undefined') {
			for(var path in err.data.errors) {
				$scope.errors.push(err.data.errors[path].message);
			}
		}
  	};

  	$scope.ok = function() {
  		if(user === null) {
			User.addUser({}, {
				name: $scope.name,
				email: $scope.email,
				devices: $scope.device ? [{
					deviceId: $scope.device._id
				}] : [],
				leavesAllowed: $scope.leavesAllowed
			}, function(data) {
				$modalInstance.close('');
			}, function(err) {
				$scope.handleErrors(err);
			});
		} else {
			var userCpy = angular.copy(user);

			userCpy.name = $scope.name;
			userCpy.email = $scope.email;
			userCpy.leavesAllowed = $scope.leavesAllowed;

			//add endedOn field on the current device
			var currentDevice = null;
			var flag = false;
			if(userCpy.devices.length > 0 && $scope.device) {
				var currentDevice = userCpy.devices.filter(function(deviceRecord) {
					return typeof deviceRecord.endedOn === 'undefined';
				})[0];

				flag = currentDevice && currentDevice.deviceId !== $scope.device._id;
				if(flag) currentDevice.endedOn = new Date();
			}

			if( ($scope.device && userCpy.devices.length === 0) || flag) {
				userCpy.devices.push({
					deviceId: $scope.device._id,
					startedOn: new Date()
				});
			}

			//delete & modify other fields
			delete userCpy._id;
			delete userCpy.__v;
			userCpy.devices.forEach(function(deviceRecord) {
				delete deviceRecord._id;
				if(typeof deviceRecord.startedOn === 'string') {
					deviceRecord.startedOn = new Date(deviceRecord.startedOn);
				}
				if(typeof deviceRecord.endedOn === 'string') {
					deviceRecord.endedOn = new Date(deviceRecord.endedOn);
				}
			});

			User.editUser({id: user._id}, userCpy,
			function(data) {
				$modalInstance.close('');
			}, function(err) {
				$scope.handleErrors(err);
			});
		}
  	};

  	$scope.cancel = function() {
  		$modalInstance.dismiss('cancel');
  	}
  });