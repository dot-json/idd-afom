var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider, $locationProvider) {
	$locationProvider.hashPrefix("!");

	// config routes
	$routeProvider
		.when("/home", {
			templateUrl: "templates/home.html"
		})
		.when("/detected", {
			templateUrl: "templates/detected.html"
		})
		.when("/resolved", {
			templateUrl: "templates/resolved.html"
		})
		.when("/statistics", {
			templateUrl: "templates/statistics.html"
		})
		.otherwise ({ 
			redirectTo: "/home" 
		});
});

app.controller("mainCtrl", function ($scope) {

});

app.controller("detectedCtrl", function ($scope, $routeParams) {
	// agkl;
});
