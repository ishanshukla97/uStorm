var mongoose = require('mongoose');
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    password: {type: String},
    firstname: {type: String},
    lastname: {type: String},
    dob: {type: String},
    gender: {type: String}
});

userSchema.pre('save', function(next){
    var user = this;
    
    if(!user.isModified('password'))    return next();
    
    //generate salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        
        //hash the password using the new salt
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);
            
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, callback){
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if (err)    callback(err);
        callback(undefined, isMatch);
    });
};
var User = mongoose.model('users', userSchema);
module.exports = User;