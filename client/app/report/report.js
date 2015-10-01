'use strict';

angular.module('bigBrotherApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/report/report.html',
        controller: 'ReportCtrl'
      });
  });