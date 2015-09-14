angular.module('bigBrotherApp')
  .controller('UserDeviceCtrl', function ($scope, $routeParams, Auth, User, Device, $http, $timeout, $modal) {
  	$scope.isLoggedIn = Auth.isLoggedIn();

  	User.getHistory({id: $routeParams.id, action: 'history'}, function(data) {
  		console.log(data);
  	});


  });