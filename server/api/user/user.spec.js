'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('./user.model');

var admin = new User({
	name: 'Admin',
	email: 'admin@admin.com',
	password: 'password',
	role: 'admin'
});

var user = new User({
	name: 'Test User',
	email: 'test@user.com'
});

var token = '';

describe('User API', function() {
	beforeEach(function (done) {
    // remove all users
    User.remove().exec().then(function() {
      // add our admin user
      var adminDup = new User(admin);
      adminDup.save(function(err) {
        if(err) done(err);
        request(app)
          .post('/auth/local')
          .send({
              "email": admin.email,
              "password": admin.password
          })
          .end(function (err, res) {
            if (err) throw err;
            // set the token
            token = res.body.token;
            done();
        });
      });
    });
  });

  it('should GET all users', function(done) {
  	request(app)
  		.get('/api/users/')
  		.expect(200)
  		.expect('Content-Type', /json/)
  		.end(function(err, res) {
  			if(err) return done(err);
  			res.body.should.be.instanceOf(Array);
  			done();
  		});
  });

  it('should add a valid user', function(done) {
  	request(app)
  		.post('/api/users/')
  		.send({
  			name: 'Test User',
  			email: 'abdulqadir@marketlytics.com'
  		})
  		.set('Authorization', 'Bearer ' + token)
  		.end(function(err, res) {
  			if(err) throw err;
  			res.body.should.have.property('_id');
  			done();
  		});
  });

  it('should fail adding an invalid user', function(done) {
  	request(app)
  		.post('/api/users/')
  		.send({
  			name: 'Test User'
  		})
  		.set('Authorization', 'Bearer ' + token)
  		.expect(422)
  		.expect('Content-Type', /json/)
  		.end(function(err, res) {
  			res.body.should.have.property('errors');
  			done();
  		});
  });

  it('should delete a user', function(done) {
  	var userDup = new User(user);
  	userDup.save(function(err, user) {
  		if(err) throw err;
  		request(app)
  			.delete('/api/users/' + user._id)
  			.set('Authorization', 'Bearer ' + token)
  			.expect(204)
  			.end(function(err, res) {
  				User.findById(user._id, function(err, deletedUser) {
  					should.not.exist(deletedUser);
            done();
  				});
  			});
  	});
  });

  it('should edit a user', function(done) {
  	var userDup = new User(user);
  	userDup.save(function(err, user) {
  		var userDup = JSON.parse(JSON.stringify(user));
  		delete userDup._id;
  		delete userDup.__v;
  		userDup.email = 'abdulqadir@marketlytics.com';
  		if(err) throw err;
  		request(app)
  			.put('/api/users/' + user._id)
  			.set('Authorization', 'Bearer ' + token)
  			.send(userDup)
  			.expect(205)
  			.end(function(err, res) {
  				User.findOne({email: 'abdulqadir@marketlytics.com'}, function(err, user) {
  					should.exist(user);
  					done();
  				});
  			});
  	});
  });

  it('should fail when editing an invalid user', function(done) {
  	request(app)
  		.put('/api/users/55da93a1db7ce44e9714073a')
  		.set('Authorization', 'Bearer ' + token)
  		.send({
  			name: 'Abdul Qadir',
  			email: 'abdulqadir@marketlytics.com',
  			disabled: false,
  			devices: [],
  			leavesAllowed: 20
  		})
  		.expect(401, done);
  });

  it('should get a single user', function(done) {
  	user.save(function(err, user) {
  		if(err) throw err;
  		request(app)
  			.get('/api/users/' + user._id)
  			.end(function(err, res) {
  				res.body.should.have.property('_id');
  				done();
  			});
  	});
  });

  it('should fail when getting an invalid user', function(done) {
  	request(app)
  		.get('/api/users/55da93a1db7ce44e9714073a')
  		.expect(401, done);
  });

});