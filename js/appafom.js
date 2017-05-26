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
	// $http.get("file-data.json")
 //    .then(function(response) {
 //        // this callback will be called asynchronously when the response is available
 //        $scope.units = response.data;
 //    }, function(response) {
 //        // called asynchronously if an error occurs or server returns response with an error status.
 //    });
});

app.controller("detectedCtrl", function ($scope, $routeParams) {
	// agkl;
});
