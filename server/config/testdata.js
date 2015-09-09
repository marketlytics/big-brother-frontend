var User = require('../api/user/user.model');
var Device = require('../api/device/device.model');

module.exports = {
	admin: new User({
		name: 'Admin',
		email: 'admin@admin.com',
		password: 'password',
		role: 'admin'
	}),
	user: {
		1: new User({
			name: 'Fake User',
			email: 'test@test.com'
		}),
		2: new User({
			name: 'Fake User 2',
			email: 'test2@test.com'
		})
	},
	device: {
		1: new Device({
			name: 'mac-01',
			mac: '01:01:01:01:01:01'
		}),
		2: new Device({
			name: 'mac-02',
			mac: '02:02:02:02:02:02'
		})
	}
};