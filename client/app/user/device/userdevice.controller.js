angular.module('bigBrotherApp')
  .controller('UserDeviceCtrl', function ($scope, $routeParams, Auth, User, Utils, Device, $timeout, $modal) {

    $scope.errors = [];

  	$scope.isLoggedIn = Auth.isLoggedIn;

    var deviceList = Device.getList();

    deviceList.$promise.then(function(data) {
      $scope.devices = data;
    });

    var user;
    var getUser = function() {
      user = User.getUser({id: $routeParams.id});
      user.$promise.then(function(data) {
        $scope.user = data;
        $scope.originalUserDevices = data.devices;
        $scope.userDevices = angular.copy(data.devices);
        $scope.userDevices.forEach(function(userDevice) {
          userDevice.checked = false;
          userDevice.startedOn = moment(userDevice.startedOn, 'X').format('MMM DD, YYYY')
          if(typeof userDevice.endedOn !== 'undefined') {
            userDevice.endedOn = moment(userDevice.endedOn, 'X').format('MMM DD, YYYY')
          }
          userDevice.name = $scope.devices.filter(function(device) {
            return userDevice.deviceId === device._id;
          })[0].name;
        });
        $scope.userDevices.sort(function(a, b) {
          return moment(a).unix() - moment(b).unix();
        });
      });
    };

    getUser();

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

      modalInstance.opened.then(function() {
        $timeout(function() {
          $('.material-dp').bootstrapMaterialDatePicker({
            time: false,
            format: 'MMM DD, YYYY'
          });
        }, 0);
      });

      modalInstance.result.then(function(msg) {
        getUser();
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
        getUser();
      }, function(err) {
        $scope.errors = Utils.getErrMessages(err);
      });
    };
  });

angular.module('bigBrotherApp')
  .controller('UserDeviceModalInstanceCtrl', function ($scope, $modalInstance, User, user, $timeout, Utils, devices, userDevice) {
    
    $scope.errors = [];
    $scope.devices = devices;
    if(userDevice !== null) {
      $scope.userDevice = angular.copy(userDevice);
      $scope.userDevice.startedOn = moment(userDevice.startedOn, 'X').format('MMM DD, YYYY');
      if(typeof $scope.userDevice.endedOn !== 'undefined') {
        $scope.userDevice.endedOn = moment(userDevice.endedOn, 'X').format('MMM DD, YYYY');
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
          userDeviceToModify.startedOn = moment($scope.userDevice.startedOn).unix()
          if($scope.userDevice.endedOn) {
            userDeviceToModify.endedOn = moment($scope.userDevice.endedOn).unix();
          }
        }
        else 
        {
          var userDevice = {
            deviceId: $scope.userDevice.deviceId,
            startedOn: moment($scope.userDevice.startedOn).unix()
          };
          if($scope.userDevice.endedOn) {
            userDevice.endedOn = moment($scope.userDevice.endedOn).unix();
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