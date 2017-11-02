var mongoose = require('mongoose');

var profileSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    username: {type: String, unique: true},
    interest: {type: String},
    hobbies: {type: String},
    expertise: {type: String}
});

var Profile = mongoose.model('profiles', profileSchema);
module.exports = Profile;