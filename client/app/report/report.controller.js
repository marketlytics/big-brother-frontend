'use strict';

//custom filter for filtering users from table body
angular.module('bigBrotherApp')
  .filter('filterUserCol', function() {
  	return function(input, search) {
  		if(search.length === 0) {
  			return input;
  		}

  		var result = {};
  		for(var userId in input) {
  			if(search.filter(function(user) { return user._id === userId; }).length) {
  				result[userId] = input[userId];
  			}
  		}
  		return result;
  	}
  });

angular.module('bigBrotherApp')
  .controller('ReportCtrl', function ($scope, User, Record, $timeout) {
      $scope.dataType = 'attendance';

      $scope.filter = {
      	users: [],
      	dp: {
			start: {
				opened: false,
				dt: moment().subtract(1, 'days').format('MMM DD, YYYY')
			},
			end: {
				opened: false,
				dt: moment().format('MMM DD, YYYY')
			}
      	}
      };

      var initDatepicker = function() {
		$('#start').bootstrapMaterialDatePicker({
			time: false,
			maxDate: moment(),
			format: 'MMM DD, YYYY'
		});

		$('#start').on('change', function(event, date) {
			$('#end').bootstrapMaterialDatePicker('setMinDate', date);
			var endDate = moment.isMoment($scope.filter.dp.end.dt) ? $scope.filter.dp.end.dt : moment($scope.filter.dp.end.dt);
			if(endDate.isBefore(date)) {
				$scope.filter.dp.end.dt = date.format('MMM DD, YYYY');
			}
			$timeout($scope.onDateChange, 0);
		});

		$('#end').bootstrapMaterialDatePicker({
			time: false,
			maxDate: moment(),
			minDate: $scope.filter.dp.start.dt,
			format: 'MMM DD, YYYY'
		});

		$('#end').on('change', function(event, date) {
			$timeout($scope.onDateChange, 0);
		});

		$('.dtp i').each(function() {
			var text = $(this).text();
			if(text === 'chevron_left' || text === 'chevron_right') {
			    $(this).addClass('mdi-navigation-' + text.replace('_', '-'));
			}
			$(this).html('');
		});	
	  }();

      //custom filter for filtering users from table header
      $scope.filterUsers = function(item) {
      	if($scope.filter.users.length === 0) {
      		return true;
      	}
      	return $scope.filter.users.filter(function(user) {
      		return user._id === item._id;
      	}).length;
      };

      $scope.onDateChange = function() {
      	fetchRecords($scope.filter.dp.start.dt, $scope.filter.dp.end.dt);
      };

      var users = User.getList();
      users.$promise.then(function(users) {
      	$scope.users = users;
      });

      $scope.data = {};

      var fetchRecords = function(start, end) {
		$scope.data = {};

		users.$promise.then(function(users) {

      		//initialize data with months, dates and users in each date a/c to date range selected in filters
      		var startMonth = moment(start).month();
      		var endMonth = moment(end).month();
	      	for(var i = startMonth; i <= endMonth; i++) {
				var date = moment().month(i);
				var monthStr = date.format('MMM YYYY');
				if(typeof $scope.data[monthStr] === 'undefined') {
					$scope.data[monthStr] = {};
				}
				var startDate = i === startMonth ? moment(start).date() : 1;
				var endDate = i === endMonth ? moment(end).date() : moment(end).endOf('month').date();
				for(var j = startDate; j <= endDate; j++) {
					$scope.data[monthStr][j] = {
						time: {
							date: j,
							day: moment().month(i).date(j).format('ddd')
						},
						users: {}
					};
					for(var k = 0; k < users.length; k++) {
						$scope.data[monthStr][j]['users'][users[k]._id] = [];
					}
				}
			}
			
			var filters = {
				include: 'users,devices',
				filter: ''
			};
			if(typeof start !== 'undefined' && start !== null) {
				filters.filter += 'start:' + moment(start).hour(0).minutes(0).unix();
			}
			if(typeof end !== 'undefined' && end !== null) {
				if(filters.filter.length > 0) {
					filters.filter += ',';
				}
				filters.filter += 'end:' + moment(end).hour(23).minutes(59).unix();
			}

			Record.getRecords(filters).$promise.then(function(data) {
				//add each record to the it's respective month, date and user inside the previously initialized data.
				data.results.forEach(function(record) {
					if(typeof record.user === 'undefined') return;

					var localRecord = angular.copy(record);
					localRecord.date = moment(localRecord.lastUpdated, 'X');
					var month = localRecord.date.format('MMM YYYY');
					var date = localRecord.date.date();
					$scope.data[month][date]['users'][record['user']].push(localRecord);
				});

				//get lowest UP time and greatest DOWN time from day for check-in and check-out time respectively
				for(var month in $scope.data) {
					for(var date in $scope.data[month]) {
						for(var user in $scope.data[month][date]['users']) {
							$scope.data[month][date]['users'][user].sort(function(a, b) {
								return a.lastUpdated - b.lastUpdated;
							});
							var arr = $scope.data[month][date]['users'][user];
							if(arr.length) {
								var checkIn = arr.filter(function(record) { return record.status === 'UP' })[0];
								var checkOut = arr.filter(function(record) { return record.status === 'DOWN' }).pop();
								$scope.data[month][date]['users'][user] = {
									checkIn: checkIn ? checkIn.date.format('HH:mm') : 'N/A', 
									checkOut: checkOut ? checkOut.date.format('HH:mm') : 'N/A'
								};
							}
						}
					}
				}

				$timeout(function() {
					$('.report-section table tbody tr').click(function() {
						$('.report-section table tbody tr').not($(this)).removeClass('highlight');
						$(this).toggleClass('highlight');
					});
				}, 0);
			});
		});
      };

      fetchRecords($scope.filter.dp.start.dt, $scope.filter.dp.end.dt);

  });
