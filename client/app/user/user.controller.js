'use strict';

angular.module('bigBrotherApp')
  .controller('UserCtrl', function ($scope, Auth, User, $http, $timeout) {
      User.getList(function(data) {
      	$timeout(function() {
      		$scope.users = data;	
      	}, 100);
      });

      
  });
