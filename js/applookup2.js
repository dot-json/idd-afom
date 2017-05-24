var app = angular.module('myApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){
    $locationProvider.hashPrefix('');
    
    // config routes
    $routeProvider
    .when('/details/:code', {
	    controller: 'detailsController',
	    templateUrl: 'lookup2template.html'
    })
})

var controllers = {};

controllers.detailsController = function($scope, $routeParams) {
    $scope.code = $routeParams.code;
}

app.controller(controllers)