// Main chatApp Controller
// Instance of io for handling socket connections, once connection is established

chatApp = angular.module('chatApp', ['ngRoute', 'ui.bootstrap', 'ui.router', 'ngMessages', 'angularytics', 'angular-loading-bar', 'ngAnimate']);
//var socket = io();
//config
chatApp.config(function($routeProvider, AngularyticsProvider){
    AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
    
    $routeProvider
    .when('/', {
        controller: 'homeController',
        templateUrl: 'home.html',
    })
    .when('/newprofile', {
        controller: 'newProfileController',
        templateUrl: '/profile/newprofile.html'
    })
    .when('/login', {
        controller: 'loginController',
        templateUrl: '/auth/login/login.html'
    })
    .when('/profile', {
        controller: 'profileController',
        templateUrl: '/profile/profile.html'
    })
    .when('/chat', {
        controller: 'chatController',
        templateUrl: '/chat/chat.html'
    })
    .when('/aboutus', {
        controller: 'aboutUsController',
        templateUrl: '/aboutus/aboutus.html'
    })
});
chatApp.run(function(Angularytics){
    Angularytics
});
