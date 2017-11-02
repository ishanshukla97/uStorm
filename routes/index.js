var express = require('express');
var User = require('../lib/User');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var path = require('path');
var Profile = require('../lib/Profile');

mongoose.connect('mongodb://ishan:blackcat2@35.161.116.149/main');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).sendFile(path.join(__dirname, '../', 'public', 'mainTemplate.html'));
    console.log(req.ip);
});

//Post Registration
router.post('/register', function(req, res){
    var email = req.body.email;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var dob = req.body.dob;
    var gender = req.body.gender;
    
    if(!validateEmail(email)){
        return res.status(400).send('Invalid Email');
    }
    
    var newUser = new User();
    newUser.email = email;
    newUser.password = password;
    newUser.firstname = firstname;
    newUser.lastname = lastname;
    newUser.dob = dob;
    newUser.gender = gender;
    newUser.save(function(err, savedUser){
        if(err){
            console.log(err);
            if(err.errmsg.includes('email')){
                return res.status(421).send('email_exist');
            }
            return res.status(500).send();
        }
        
        return res.status(200).send();
    });
});

//Post method for login
router.post('/login', function(req, res){
    var secret = 'cat';
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({ email: email }, function(err, user){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        
        if(!user){
            return res.status(404).send();
        }
        
        user.comparePassword(password, function(err, isMatch){
            if(isMatch && isMatch == true){
                //If password matches then send token
                console.log(user.firstname);
                var token = jwt.sign(user, secret, { expiresIn: 60*60*2});
                res.json({ token: token,
                           name:  user.firstname});
            }
            else{
                return res.status(401).send();
            }
        });
    });
});

router.get('/chat', function(req, res){
    //Configured in app.js
    res.status(200).sendFile(path.join(__dirname, '../', 'public', 'chat', 'chat.html'));
});

router.get('/profile', function(req, res){
    var reqToken = req.headers.authorization;
    reqToken = reqToken.replace('Bearer ', '');
    var payload = jwt.decode(reqToken, {complete: true}).payload;
    var email = payload._doc.email;
    Profile.findOne({email: email}, function(err, profile){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        
        if(!profile){
            return res.status(404).send();
        }
        
        var jsonProfile = {
            interest: profile.interest,
            hobbies: profile.hobbies,
            expertise: profile.expertise,
            username: profile.username
        }
        return res.status(200).send(jsonProfile);
    });
    
});


router.post('/profile/update', function(req, res){
    //parse json token
    var reqToken = req.headers.authorization;
    reqToken = reqToken.replace('Bearer ', '');
    var payload = jwt.decode(reqToken, {complete: true}).payload;
    var email = payload._doc.email;
    //parse update data
    var username = req.body.username;
    var interest = req.body.interest;
    var hobbies = req.body.hobbies;
    var expertise = req.body.expertise;

    if(interest){
        Profile.findOneAndUpdate({email:email}, {interest: interest}, function(err){
            if(err){
                return res.status(500).send();
            }
        });
    }
    if(hobbies){
        Profile.findOneAndUpdate({email: email}, {hobbies: hobbies}, function(err){
            if(err){
                return res.status(500).send();
            }
        });
    }
    if(expertise){
        Profile.findOneAndUpdate({email:email}, {expertise: expertise}, function(err){
            if(err){
                return res.status(500).send();
            }
        });
    }
    res.status(200).send("Updated");
});

router.post('/profile/newprofile', function(req, res){
    //parse json token
    var reqToken = req.headers.authorization;
    reqToken = reqToken.replace('Bearer ', '');
    var payload = jwt.decode(reqToken, {complete: true}).payload;
    var email = payload._doc.email;
    
    console.log(req.body);
    
    //Handle Invalid data
    if(!(req.body.interest && req.body.hobbies && req.body.expertise && req.body.username)){
        return res.status(400).send('Invalid Data');
    }
    
    //parse update data
    var interest = req.body.interest;
    var hobbies = req.body.hobbies;
    var expertise = req.body.expertise;
    var username = req.body.username;
    
    //create a new Profile and save it
    var newProfile = new Profile();
    newProfile.email = email;
    newProfile.interest = interest;
    newProfile.hobbies = hobbies;
    newProfile.expertise = expertise;
    newProfile.username = username;
    
    //save newProfile
    newProfile.save(function(err, savedProfile){
        if(err){
            console.log(err);
            if(err.errmsg.includes('username')){
                return res.status(420).send('username_not_avail');
            }
            else if(err.errmsg.includes('email')){
                return res.status(421).send('email_exist')
            }
        }
        return res.status(200).send('Saved Successfully!');
    });
});

router.get('/profile/:search_user', function(req, res){
    var search_user = req.params['search_user'];
    console.log(search_user);
    
    Profile.findOne({username: search_user}, function(err, profile){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        
        if(!profile){
            return res.status(404).send();
        }
        
        var jsonProfile = {
            interest: profile.interest,
            hobbies: profile.hobbies,
            expertise: profile.expertise
        }
        
        User.findOne({email: profile.email}, function(err, user){
            if(err){
                console.log(err);
                return res.status(500).send();
            }
            
            if(!user){
                return res.status(404).send();
            }
            var fullname = user.firstname + " " + user.lastname;
            jsonProfile.fullname = fullname;
            console.log(user.dob.slice(0,5).toString());
            jsonProfile.age = 2016 - user.dob.slice(0,4).toString();
            jsonProfile.gender = user.gender;
            return res.status(200).send(jsonProfile);
        });
    });
});

router.get('/sitemap.xml', function(req, res){
    res.sendFile(path.join(__dirname, '../public', 'sitemap.xml'));
});

//******************************************************************************************************
//Helper function to check if a username is available
function is_usernamAvail(username, email){
    Profile.findOneAndUpdate({email: email}, {username: username}, function(err, savedUser){
        if(err){
            console.log('Error Occurd whle usrnmae');
            return 0;
        }
        console.log(savedUser);
        return 1;
    });
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = router;
