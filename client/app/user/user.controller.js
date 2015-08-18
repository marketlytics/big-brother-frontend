'use strict';

angular.module('bigBrotherApp')
  .controller('UserCtrl', function ($scope, Auth, User, Device, $http, $timeout, $modal) {

      var getUserList = function() {
	  	User.getList(function(data) {
			$timeout(function() {
				$scope.users = angular.copy(data);
				$scope.users.forEach(function(user) {
					user.checked = false;
				});
			}, 100);
		});
	  };

	  getUserList();

      $scope.open = function() {
      	var modalInstance = $modal.open({
      		templateUrl: 'addUser.html',
      		animation: true,
      		controller: 'UserModalInstanceCtrl',
      		resolve: {
      			devices: function() {
      				return Device.getList();
      			}
      		}
      	});

      	modalInstance.result.then(function() {
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
  .controller('UserModalInstanceCtrl', function ($scope, User, $modalInstance, devices) {
  	$scope.devices = devices;
  	$scope.ok = function() {
  		User.addUser({}, {
  			name: $scope.name,
  			email: $scope.email,
  			devices: [{
  				deviceId: $scope.device._id
  			}],
  			leavesAllowed: $scope.leavesAllowed
  		}, function(data) {
  			$modalInstance.close(null);
  			
  		}, function(err) {
  			
  			//TODO: show error message
  		});
  	};

  	$scope.cancel = function() {
  		$modalInstance.dismiss('cancel');
  	}
  });