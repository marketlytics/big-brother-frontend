'use strict';

angular.module('bigBrotherApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/users', {
        templateUrl: 'app/user/list/userlist.html',
        controller: 'UserListCtrl'
      });
  });