angular.module('chatApp')
.controller('loginController', function($scope, $http, $window, $location, $rootScope){
    if($window.sessionStorage.token){
        $location.path('/profile');
    }
    $scope.submit = function(){
        $scope.alerts = {};
        $scope.user = {email: $scope.email, password: $scope.password};
        $http
            .post('/login', $scope.user)
            .success(function(data, status, headers, config){
                $window.sessionStorage.token = data.token;
                $window.sessionStorage.validName = data.name;
                if($window.sessionStorage.validName){
                    $location.path('/profile');
                }
                //creating a valid user property in scope for use in sockets
            })
            .error(function (data, status, headers, config) {
                // Erase the token if the user fails to log in
                delete $window.sessionStorage.token;
                
                if(status == '401' || status == '404'){
                    $scope.alerts.invalid = true;
                }
      });
    }
    $scope.signupPage = function() {
        $location.path('/');
    }
    $scope.aboutusPage = function(){
        $location.path('/aboutus');
    }
});