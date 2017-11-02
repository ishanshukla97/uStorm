/* Define registerProfile controller to make calls to api for setting a user profile for first time use
 * After that Proceed to next tasks: redirect to user profile page
 */

angular.module('chatApp')
.controller('newProfileController', function($http, $location, $window, $scope){
    //check user token
    if(!$window.sessionStorage.token){
        $location.path('/login');
    }
    $scope.submitProfile = function(){
        //Alert Handler
        $scope.alerts = {
            empty_fields: false,
            username_unavailable: false
        };
        
        //Get user data
        var data = {};
        var proceed = false;
        data.username = $scope.username;
        data.interest = $scope.interest;
        data.expertise = $scope.expertise;
        data.hobbies = $scope.hobbies;
        
        //Handling alerts
        if(data.username == undefined || data.expertise == undefined || data.hobbies == undefined
           || data.interest == undefined){
            $scope.alerts.empty_fields = true;
            proceed = false;
        }
        else{
            proceed = true;
        }
        
        //Create http.post request
        if(proceed){
            var req = {
                method:'POST',
                url: '/profile/newprofile',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + $window.sessionStorage.token
                },
                data: data
            }

            //now post data
            $http(req)
            .then(function success(response){
                $location.path('/profile');
            },
            function error(response){
                if(response.status == '401'){
                    delete $window.sessionStorage.token;
                    $location.path('/login');
                }
                if(response.status == '421'){
                    alert('You already have created a profile with us.');
                    $location.path('/profile');
                }
                if(response.status == '420'){
                    alert("Oops! That username is already taken");
                }
            });
        }
    }
});