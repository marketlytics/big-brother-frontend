'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('../user/user.model');

var admin = new User({
	name: 'Admin',
	email: 'admin@admin.com',
	password: 'password',
	role: 'admin'
});

describe('Admin Login', function() {
	it('should return token on passing correct credentials', function(done) {
		admin.save(function(err, admin) {
			request(app)
				.post('/auth/local')
				.send({
					email: admin.email,
					password: admin.password
				})
				.end(function (err, res) {
					if(err) throw err;
					res.body.should.have.property('token');
					done();
				})
		});
	});

	it('should return 401 on passing in-correct credentials', function(done) {
		admin.save(function(err, admin) {
			request(app)
				.post('/auth/local')
				.send({
					email: admin.email,
					password: admin.password + '1'
				})
				.expect(401, done);
		});
	});
});