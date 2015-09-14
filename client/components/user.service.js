'use strict';

angular.module('bigBrotherApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:action', {
      id: '@_id'
    },
    {
      getList: {
        method: 'GET',
        isArray: true
      },
      getHistory: {
        method: 'GET',
        isArray: true
      },
      addUser: {
        method: 'POST'
      },
      deleteUser: {
        method: 'DELETE'
      },
      editUser: {
        method: 'PUT'
      }
	  });
  });