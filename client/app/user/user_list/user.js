'use strict';

angular.module('bigBrotherApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/users', {
        templateUrl: 'app/user/user_list/user.html',
        controller: 'UserCtrl'
      });
  });