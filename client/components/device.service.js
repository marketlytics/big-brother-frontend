'use strict';

angular.module('bigBrotherApp')
  .factory('Device', function ($resource) {
    return $resource('/api/devices/:id', {
      id: '@_id'
    },
    {
      getList: {
        method: 'GET',
        isArray: true
      }
	  });
  });