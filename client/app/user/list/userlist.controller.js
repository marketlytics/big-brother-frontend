'use strict';

angular.module('bigBrotherApp')
  .controller('UserListCtrl', function ($scope, Auth, User, Device, $http, $timeout, $modal) {
  	  $scope.users = [];
  	  var deviceList = Device.getList();

  	  var replaceGravatar = function() {
  	  	$('.user-img').each(function() {
  	  		var _this = $(this);
  	  		_this.css('background-image', 'url('+_this.find('img').attr('src')+')');
  	  		_this.find('img').remove();
  	  	});
  	  };

      var getUserList = function() {
	  	User.getList(function(data) {
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

			var colNum = 2;
			$scope.rows = [];
			var cols = [];
			$scope.users.forEach(function(user, index) {
				cols.push(user);
				if(cols.length === colNum || index === $scope.users.length - 1) {
					$scope.rows.push(cols);
					cols = [];
				}
			});

			$timeout(replaceGravatar, 10);
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
  .controller('UserModalInstanceCtrl', function ($scope, $timeout, User, Utils, $modalInstance, devices, user) {
  	
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
				$scope.errors = Utils.getErrMessages(err);
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
				if(flag) currentDevice.endedOn = moment().set({hour: 0, minutes: 0, seconds: 0}).unix();
			}

			if( ($scope.device && userCpy.devices.length === 0) || flag) {
				userCpy.devices.push({
					deviceId: $scope.device._id
				});
			}

			//delete & modify other fields
			delete userCpy._id;
			delete userCpy.__v;
			userCpy.devices.forEach(function(deviceRecord) {
				delete deviceRecord._id;
				if(typeof deviceRecord.startedOn === 'string') {
					deviceRecord.startedOn = moment(deviceRecord.startedOn).set({hour: 0, minutes: 0, seconds: 0}).unix();
				}
				if(typeof deviceRecord.endedOn === 'string') {
					deviceRecord.endedOn = moment(deviceRecord.endedOn).set({hour: 0, minutes: 0, seconds: 0}).unix();
				}
			});

			User.editUser({id: user._id}, userCpy,
			function(data) {
				$modalInstance.close('');
			}, function(err) {
				$scope.errors = Utils.getErrMessages(err);
			});
		}
  	};

  	$scope.cancel = function() {
  		$modalInstance.dismiss('cancel');
  	}
  });