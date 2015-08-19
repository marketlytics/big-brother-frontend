'use strict';

var should = require('should');
var User = require('../user/user.model');

var admin = new User({
  name: 'Admin',
  role: 'admin',
  email: 'admin@admin.com',
  password: 'password',
});

var adminWithoutEmail = new User({
	name: 'Admin',
	role: 'admin',
	password: 'admin'
});

var adminWithoutRole = new User({
	name: 'Admin',
	email: 'admin@admin.com',
	password: 'password'
});

var adminWithoutPassword = new User({
	name: 'Admin',
	email: 'admin@admin.com',
	role: 'admin'
});

describe('User Model (Admin)', function() {

	before(function(done) {
    // Clear users before testing
    User.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    User.remove().exec().then(function() {
      done();
    });
  });
	
	it('should begin with no admins', function(done) {
    User.find({role: 'admin'}, function(err, users) {
      users.should.have.length(0);
      done();
    });
  });

  it('should fail when saving without an email', function(done) {
  	adminWithoutEmail.save(function(err) {
  		should.exist(err);
  		done();
  	});
  });

  it('should fail when saving without a role', function(done) {
  	adminWithoutRole.save(function(err) {
  		should.exist(err);
  		done();
  	});
  });

  it('should fail when saving without a password', function(done) {
  	adminWithoutPassword.save(function(err) {
  		should.exist(err);
  		done();
  	});
  });

  it('should fail when saving duplicate admin', function(done) {
  	admin.save(function(err, user) {
  		var adminDup = new User(admin);
  		adminDup.save(function(err) {
  			should.exist(err);
  			done();
  		});
  	});
  });

	it('should save successfully', function(done) {
		var adminCpy = new User(admin); //fix - "VersionError: No matching document found".
    adminCpy.save(function(err) {
    	User.find({role: 'admin'}, function(err, users) {
    		users.should.have.length(1);
    		done();
    	})
    });
  });

  it("should authenticate admin if password is valid", function() {
    return admin.authenticate('password').should.be.true;
  });

  it("should not authenticate admin if password is invalid", function() {
    return admin.authenticate('blah').should.not.be.true;
  });

});

