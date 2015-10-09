angular.module('bigBrotherApp')
  .controller('UserDeviceCtrl', function ($scope, $routeParams, Auth, User, Utils, Device, $timeout, $modal) {

    $scope.errors = [];

  	$scope.isLoggedIn = Auth.isLoggedIn;

    var deviceList = Device.getList();

    deviceList.$promise.then(function(data) {
      $scope.devices = data;
    });

    var user = User.getUser({id: $routeParams.id});
    user.$promise.then(function(data) {
      $scope.user = data;
    });

    var getUserHistory = function() {  	
    	User.getHistory({id: $routeParams.id, action: 'history'}, function(data) {
    		$scope.originalUserDevices = data;
        $scope.userDevices = angular.copy(data);
        $scope.userDevices.forEach(function(userDevice) {
          userDevice.checked = false;
          userDevice.startedOn = moment.utc(userDevice.startedOn, 'X').format('ll')
          if(typeof userDevice.endedOn !== 'undefined') {
            userDevice.endedOn = moment.utc(userDevice.endedOn, 'X').format('ll')
          }
        });
        $scope.userDevices.sort(function(a, b) {
          return moment(a.startedOn).toDate() - moment(b.startedOn).toDate();
        });
    	});
    };

    getUserHistory();

    $scope.openUserDeviceModal = function(userDevice) {
      var modalInstance = $modal.open({
        templateUrl: 'userDeviceForm.html',
        animation: true,
        controller: 'UserDeviceModalInstanceCtrl',
        resolve: {
          user: function() {
            return user;
          },
          devices: function() {
            return deviceList;
          },
          userDevice: function() {
            if(userDevice === null) return null;
            return $scope.originalUserDevices.filter(function(originalUserDevice) {
              return originalUserDevice._id === userDevice._id;
            })[0];
          }
        }
      });

      modalInstance.result.then(function(msg) {
        getUserHistory();
      });
    };

    $scope.onToggle = function(userDevice) {
      userDevice.checked = !userDevice.checked;
    };

    $scope.onDelete = function() {
      var userCpy = angular.copy($scope.user.toJSON());
      userCpy.devices = userCpy.devices.filter(function(userDevice) {
        return $scope.userDevices.filter(function(thisUserDevice) {
          return thisUserDevice.checked && userDevice._id === thisUserDevice._id;
        }).length === 0;
      });
      delete userCpy._id;
      delete userCpy.__v;
      User.editUser({id: $scope.user._id}, userCpy, function(data) {
        getUserHistory();
      }, function(err) {
        $scope.errors = Utils.getErrMessages(err);
      });
    };
  });

angular.module('bigBrotherApp')
  .controller('UserDeviceModalInstanceCtrl', function ($scope, $modalInstance, User, user, $timeout, Utils, devices, userDevice) {
    
    $scope.dp = {
      start: {
        openend: false,
      },
      end: {
        opened: false,
      }
    };

    $scope.openDatePopup = function(dp) {
      $timeout(function() {
        dp.opened = true;
      }, 0);
    }

    $scope.errors = [];
    $scope.devices = devices;
    if(userDevice !== null) {
      $scope.userDevice = angular.copy(userDevice);
      $scope.userDevice.startedOn = moment.utc(userDevice.startedOn, 'X').format('MMM DD, YYYY');
      if(typeof $scope.userDevice.endedOn !== 'undefined') {
        $scope.userDevice.endedOn = moment.utc(userDevice.endedOn, 'X').format('MMM DD, YYYY');
      }
    }

    $scope.ok = function() {
      if(typeof $scope.userDevice.deviceId !== 'undefined' && typeof $scope.userDevice.startedOn !== 'undefined')
      {

        if(typeof $scope.userDevice._id !== 'undefined')
        {
          var userDeviceToModify = user.devices.filter(function(userDevice) {
            return userDevice._id === $scope.userDevice._id;
          })[0];
          userDeviceToModify.deviceId = $scope.userDevice.deviceId;
          userDeviceToModify.startedOn = moment($scope.userDevice.startedOn).add(1, 'days').set({hour: 0, minutes: 0, seconds: 0}).unix()
          if($scope.userDevice.endedOn) {
            userDeviceToModify.endedOn = moment($scope.userDevice.endedOn).add(1, 'days').set({hour: 0, minutes: 0, seconds: 0}).unix();
          }
        }
        else 
        {
          var userDevice = {
            deviceId: $scope.userDevice.deviceId,
            startedOn: moment($scope.userDevice.startedOn).add(1, 'days').set({hour: 0, minutes: 0, seconds: 0}).unix()
          };
          if($scope.userDevice.endedOn) {
            userDevice.endedOn = moment($scope.userDevice.endedOn).add(1, 'days').set({hour: 0, minutes: 0, seconds: 0}).unix();
          }
          user.devices.push(userDevice);
        }

        var userCpy = angular.copy(user);
        delete userCpy._id;
        delete userCpy.__v;
        User.editUser({id: user._id}, userCpy, function(data) {
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