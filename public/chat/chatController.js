angular.module('chatApp')

.controller('chatController', function($scope, $window, $location, $rootScope, chatFactory){
    $scope.send = function(){
        if(!$scope.message){
            return;
        }
        chatFactory.sendMessage($scope.message);
        $scope.message = "";
    };
    
    $scope.users = chatFactory.userList;
    setInterval(function(){
        $scope.users = chatFactory.userList;
        $scope.$apply();
    }, 500);
    
    $scope.exitRoom = function(){
        chatFactory.exitRoom();
        $location.path('/profile');
    };
    
});




















