angular.module('chatApp')

.controller('aboutUsController', function($scope, $location){
   $scope.signUp = function(){
       $location.path('/');
   }
   
   $scope.LoginPage = function(){
       $location.path('/login');
   }
});