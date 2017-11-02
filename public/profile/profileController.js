angular.module('chatApp')

.controller('profileController', function($scope, $window, $http, $location, $route, $interval){
    //if user doesn't have a token
    if(!$window.sessionStorage.token){
        $location.path('/login');
    }
    //init function to get profile on load
    $scope.init = function(){
        var req = {
            method: 'GET',
            url: '/profile',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + $window.sessionStorage.token
            }
        }//request
        
        //now get data
        $http(req)
        .then(function(response){
            $scope.interests = response.data.interest;
            $scope.hobbies = response.data.hobbies;
            $scope.expertise = response.data.expertise;
            $scope.username = response.data.username;
            
            $window.sessionStorage.interest = $scope.interests;
            $window.sessionStorage.expertise = $scope.expertise;
            $window.sessionStorage.hobbies = $scope.hobbies;
            
        },
             function(response){
            if(response.status == 401){
                delete $window.sessionStorage.token;
            }
            else if(response.status == 500){
                alert("Internal server error");
            }
            else if(response.status == 404){
                alert("You haven't setup your profile yet");
                $location.path('/newprofile');
            }
        });
        
        //
    }
    
    //update
    $scope.updateProfile = function(){
        //form request object
        var req = {
            method: 'POST',
            url: '/profile/update',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + $window.sessionStorage.token
            },
            data: {
                interest: $scope.updateInterests,
                hobbies: $scope.updateHobbies,
                expertise: $scope.updateExpertise
            }
        };
        
        //http post request
        $http(req)
        .then(function(response){
            updateProfileElements(response);
            location.reload();
        },
             function(response){
            if(response.status == 404){
                alert("You haven't setup your profile yet");
                $location.path('/newprofile');
            }
        });
        
        
        //Function to update profile elements after response
        function updateProfileElements(res){
            if(!res.data){
                return 0;
            }
            $scope.interests = res.data.interest;
            $scope.hobbies = res.data.hobbies;
            $scope.expertise = res.data.expertise;
            return 1;
        }
    }
    
    $scope.gotoChat = function(){
        $location.path('/chat');
        location.reload();
    }
    
    $scope.logout = function(){
        delete $window.sessionStorage.token;
        redirectToLogin();
    }
    
    $scope.search = function(){
        var search_query = $scope.search_query;
        
        if(search_query == undefined){
            return;
        }
        
        //Form req obj
        var req = {
            method: 'GET',
            url: '/profile/' + search_query,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + $window.sessionStorage.token
            }
        };
        
        //http post request
        $http(req)
        .then(function(response){
            var search_result = {};
            search_result.interest = response.data.interest;
            search_result.hobbies = response.data.hobbies;
            search_result.expertise = response.data.expertise;
            search_result.fullname = response.data.fullname;
            search_result.age = response.data.age;
            search_result.gender = response.data.gender;
            
            //Bind search results to $scope
            $scope.search_result = {};
            $scope.search_result.interests = search_result.interest;
            $scope.search_result.hobbies = search_result.hobbies;
            $scope.search_result.expertise = search_result.expertise;
            $scope.search_result.fullname = search_result.fullname;
            $scope.search_result.age = search_result.age;
            $scope.search_result.gender = search_result.gender;
            $("#myModal").modal();
        },
             function(response){
            $scope.search_result = {};
            $scope.search_result.interests = "-";
            $scope.search_result.hobbies = "-";
            $scope.search_result.expertise = "-";
            $scope.search_result.fullname = "User Not Found";
            $scope.search_result.age = "-";
            $scope.search_result.gender = "-";
            $("#myModal").modal();
        });
    }
    
    
    
    
    //************************************************************************************************
    //Helper functions
    function redirectToLogin(){
        $location.path('/');
    }
});