var app = angular.module('AllmightyTwitchToolbox', ['ngRoute', 'ngSanitize']);


app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: './assets/html/home.html',
        controller: 'HomeController'
    }).otherwise({redirectTo: '/'});
});