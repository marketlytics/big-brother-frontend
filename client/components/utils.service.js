angular.module('bigBrotherApp')
  .factory('Utils', function () {
  	return {
  		getErrMessages: function(err) {
  			var msgs = [];
  			if(typeof err.data !== 'undefined' && err.data.errors !== 'undefined') {
				for(var path in err.data.errors) {
					msgs.push(err.data.errors[path].message);
				}
			}
			return msgs;
  		}
  	};
  });