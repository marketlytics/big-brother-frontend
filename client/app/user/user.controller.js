'use strict';

angular.module('bigBrotherApp')
  .controller('UserCtrl', function ($scope, Auth, User, Device, $http, $timeout, $modal) {
  	  $scope.users = [];

      var getUserList = function() {
	  	User.getList(function(data) {
			$timeout(function() {
				$scope.originalUsersArr = data;
				$scope.users = angular.copy(data);
				$scope.users.forEach(function(user) {
					user.checked = false;
				});
			}, 100);
		});
	  };

	  getUserList();

      $scope.openUserModal = function(type) {
      	var modalInstance = $modal.open({
      		templateUrl: 'userForm.html',
      		animation: true,
      		controller: 'UserModalInstanceCtrl',
      		resolve: {
      			devices: function() {
      				return Device.getList();
      			},
      			user: function() {
      				if(type === 'add') {
      					return null;
      				}
      				var scopeUser = $scope.users.filter(function(user) {
      					return user.checked;
      				})[0];
      				return $scope.originalUsersArr.filter(function(user) {
      					return scopeUser._id === user._id;
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
  	
  	if(user !== null) {
  		$scope.name = user.name;
		$scope.email = user.email;
		devices.$promise.then(function(devices) {
			$timeout(function() {
				$scope.device = devices.filter(function(device) {
					return device._id === user.devices.filter(function(device) {
						return typeof device.endedOn === 'undefined';
					})[0].deviceId;
				})[0];
			}, 100);
		});
		$scope.leavesAllowed = user.leavesAllowed;
  	}

  	$scope.ok = function() {
  		if(user === null) {
			User.addUser({}, {
				name: $scope.name,
				email: $scope.email,
				devices: [{
					deviceId: $scope.device._id
				}],
				leavesAllowed: $scope.leavesAllowed
			}, function(data) {
				$modalInstance.close('');
			}, function(err) {
				//TODO: show error messages
			});
		} else {
			var userCpy = angular.copy(user);

			userCpy.name = $scope.name;
			userCpy.email = $scope.email;
			userCpy.leavesAllowed = $scope.leavesAllowed;

			//add new device
			if(user.devices[user.devices.length - 1].deviceId !== $scope.device._id) {
				var currentDevice = userCpy.devices.filter(function(device) {
					return typeof device.endedOn === 'undefined';
				})[0];
				currentDevice.endedOn = new Date();
				userCpy.devices.push({
					deviceId: $scope.device._id
				});
			}

			//delete unwanted fields
			delete userCpy._id;
			delete userCpy.__v;
			userCpy.devices.forEach(function(deviceRecord) {
				delete deviceRecord._id;
				if(typeof deviceRecord.startedOn !== 'undefined') {
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
				//TODO: show error messages
				console.log(err);
			});
		}
  	};

  	$scope.cancel = function() {
  		$modalInstance.dismiss('cancel');
  	}
  });