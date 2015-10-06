'use strict';

angular.module('bigBrotherApp')
  .controller('ReportCtrl', function ($scope, User, Record) {
      $scope.dataType = 'attendance';

      $scope.range = {
      	start: moment().month(moment().month() - 1),
      	end: moment()
      };

      var startMonth = $scope.range.start.month();
      var endMonth = $scope.range.end.month();

      $scope.data = {};

      User.getList().$promise.then(function(users) {
      	
      	//initialize data
      	$scope.users = users;
      	for(var i = startMonth; i <= endMonth; i++) {
			var date = moment().month(i);
			var monthStr = date.format('MMM YYYY');
			if(typeof $scope.data[monthStr] === 'undefined') {
				$scope.data[monthStr] = {};
			}
			var endDate = date.endOf('month').date();
			for(var j = 1; j <= endDate; j++) {
				$scope.data[monthStr][j] = {};
				for(var k = 0; k < users.length; k++) {
					$scope.data[monthStr][j][users[k]._id] = [];
				}
			}
		}

		Record.getRecords({include: 'users,devices'}).$promise.then(function(data) {
			
			data.results.forEach(function(record) {
				if(typeof record.user === 'undefined') return;

				var localRecord = angular.copy(record);
				localRecord.date = moment(localRecord.lastUpdated);
				var month = localRecord.date.format('MMM YYYY');
				var date = localRecord.date.date();
				$scope.data[month][date][record['user']].push(localRecord);
			});

			for(var month in $scope.data) {
				for(var date in $scope.data[month]) {
					for(var user in $scope.data[month][date]) {
						$scope.data[month][date][user].sort(function(a, b) {
							return a.lastUpdated - b.lastUpdated;
						});
						var arr = $scope.data[month][date][user];
						if(arr.length) {
							$scope.data[month][date][user] = {
								checkIn: arr.filter(function(record) { return record.status === 'UP' })[0].date.format('LT'), 
								checkOut: arr.filter(function(record) { return record.status === 'DOWN' }).pop().date.format('LT')
							};
						}
					}
				}
			}
		});

      });
  });
