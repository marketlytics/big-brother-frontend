var User = require('../server/api/user/user.model');
var Device = require('../server/api/device/device.model');
var moment = require('moment');

var device1 = new Device({
	name: 'mac01',
	mac: '10:93:e9:5e:f5:92',
	createdOn: new Date()
});

var device2 = new Device({
	name: 'mac02',
	mac: 'e3:91:21:54:97:f5',
	createdOn: new Date()
});

var device3 = new Device({
	name: 'mac03',
	mac: 'e3:91:21:54:98:e1',
	createdOn: new Date()
});

var testdata = {

	devices: {
		0: device1,
		1: device2,
		2: device3,
		deviceToAdd: new Device({
			name: 'mac04',
			mac: '01:01:01:01:01:01',
			createdOn: new Date()
		})
	},

	users: {
		0: new User({
			name: 'Admin',
			email: 'admin@admin.com',
			password: 'admin',
			role: 'admin'
		}),
		1: new User({
			name: 'Mashhood',
			email: 'mashhoodr@gmail.com',
			devices: [{
				deviceId: device3._id,
				startedOn: moment().subtract(10, 'days').set({hour: 0, minutes: 0, seconds: 0}).unix(),
				endedOn: moment().subtract(5, 'days').set({hour: 0, minutes: 0, seconds: 0}).unix()
			}, {
				deviceId: device2._id,
				startedOn: moment().subtract(5, 'days').set({hour: 0, minutes: 0, seconds: 0}).unix(),
				endedOn: moment().set({hour: 0, minutes: 0, seconds: 0}).unix()
			},{
				deviceId: device1._id
			}]
		}),
		2: new User({
			name: 'Abdul Qadir',
			email: 'abdulqadir@marketlytics.com',
			devices: [{
				deviceId: device2._id
			}]
		}),
		userToAdd: new User({
			name: 'Hussain M',
			email: 'hussainm@marketlytics.com'
		})
	}

};

module.exports = testdata;