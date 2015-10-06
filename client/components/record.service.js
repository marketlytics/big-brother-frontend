'use strict';

angular.module('bigBrotherApp')
  .factory('Record', function ($resource) {
    return $resource('/api/records', {},
    {
      getRecords: {
        method: 'GET'
      }
	  });
  });