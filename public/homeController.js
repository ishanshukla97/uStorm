angular.module('chatApp')

.controller('homeController', function($http, $scope, $window, $location){
    var alerter;
    $scope.registerSubmit = function(){
        $scope.alerts = {
            email_nomatch: false,
            email_exist: false,
            incomplete_name: false,
            password_nomatch: false,
            no_password: false,
            invalid_dob: false,
            invalid_gender: false,
            email_regex_fail: false
        };
        
        
        var email_proceed = false;
        var pass_proceed = false;
        
        var email = {};
        var password = {};
        email.first = $scope.firstEm;
        email.second = $scope.reEm;
        password.first = $scope.firstPwd;
        password.second = $scope.rePwd;
        var dob = $scope.dob.year.toString()+ 
                  $scope.dob.month.toString()+
                  $scope.dob.date.toString();
        var gender = $scope.gender;
        var firstname = $scope.firstname;
        var lastname = $scope.lastname;
        
        //Validating Inputs *************************************
        if(validateEmail(email.first)){
            email_proceed = true;
        }
        else{
            $scope.alerts.email_regex_fail = true;
            email_proceed = false;
        }
        if(matchEmails(email.first, email.second)){
            email_proceed = true;
        }
        else{
            $scope.alerts.email_nomatch = true;
            email_proceed = false;
        }
        
        if(password.first == undefined || password.second == undefined){
            $scope.alerts.no_password = true;
            pass_proceed = false;
        }
        else{
            pass_proceed = true;
        }
        if(matchPasswords(password.first, password.second)){
            pass_proceed = true;
        }
        else{
            $scope.alerts.password_nomatch = true;
            pass_proceed = false;
        }
        
        if(gender == undefined){
            $scope.alerts.invalid_gender = true;
            pass_proceed = false;
        }
        //VAlidating Email End*********************************
        
        if(email_proceed && pass_proceed){
            post_req();
        }
        
        function post_req(){
            $scope.regCredentials = {
                email: email.first,
                firstname: firstname,
                lastname: lastname,
                dob: dob,
                gender: gender,
                password: password.first
            };
            
            $http
            .post('/register', $scope.regCredentials)
            .success(function(data, status, headers, config){
                $location.path('/login');
            })
            .error(function(data, status, headers, config){
                if(status == '500'){
                    alert('Internal Server Error');
                }
                else if(status == '421'){
                    $scope.alerts.email_exist = true;
                }
                else if(status == '400'){
                    $scope.alerts.email_regex_fail = true;
                }
            });
        }//if proceed
    }
    
    $scope.login = function(){
        $location.path('/login');
    }
    $scope.aboutusPage = function(){
        $location.path('/aboutus');
    }
});



//Sanitizer functions
//Check if the email ids match
function matchEmails(firstEntry, reEntry){
    if(firstEntry !== reEntry){
        return 0;
    }
    return 1;
}//matchEmails()

//Check if passwords match
function matchPasswords(firstEntry, reEntry){
    if(firstEntry !== reEntry){
        return 0;
    }
    return 1;
}//matchPasswords()

//Validate Email
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}