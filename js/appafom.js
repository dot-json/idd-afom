var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider, $locationProvider) {

	$locationProvider.hashPrefix("!");

	// config routes
	$routeProvider
		.when("/", {
			templateUrl: "templates/home.html"
		})
		.when("/fallouts", {
			controller	: "falloutsCtrl",
			templateUrl	: "templates/fallouts.html"
		})
		.when("/resolutions", {
			controller	: "resolutionsCtrl",
			templateUrl	: "templates/resolutions.html"
		})
		.when("/statistics", {
			templateUrl: "templates/statistics.html"
		})
		.when("/404", {
			templateUrl: "templates/404.html"
		})
		.otherwise ({ 
			redirectTo: "404" 
		});
});

app.controller("mainCtrl", function ($scope) {

});

app.controller("falloutsCtrl", function ($scope, $http) {
	
	// fallout data init
	$scope.fallouts = [];

	// table sort data init
	$scope.sortType	= "id"; 	// set default sort type
	$scope.sortReverse = false;  	// set default sort order
	$scope.searchId = "";	 	// set default search/filter term

	// get fallout data from herokuapp api
	$http.get("https://comptel-api.herokuapp.com/api/fallouts")
	.then(function(response) { 
		// async success
		$scope.fallouts = response.data.docs;
	}, function(response) { 
		// async error
	});
});

app.controller("resolutionsCtrl", function ($scope, $http) {
	
	// fallout data init
	$scope.resolutions = [];

	// table sort data init
	$scope.sortType	= "id"; 	// set default sort type
	$scope.sortReverse = false;  	// set default sort order
	$scope.searchId = "";	 	// set default search/filter term

	// get fallout data from herokuapp api
	$http.get("https://comptel-api.herokuapp.com/api/resolutions")
	.then(function(response) { 
		// async success
		$scope.resolutions = response.data.docs;
	}, function(response) { 
		// async error
	});
});

app.directive("ngDetails", function ($parse, $http) {
	var linkFunction = function (scope, element, attributes) {
		scope.query = "https://comptel-api.herokuapp.com/api/details/" + attributes.ngDetails;

		$http.get(scope.query)
		.then(function(response) { 
			// async success
			scope.details = response.data;
		}, function(response) { 
			// async error
		});
	};
	return {
		restrict: "A",
		link: linkFunction,
		template: "<ul data-ng-repeat='d in details'><li><strong>Name: </strong>{{ d.property_name }}</li><li><strong>Property: </strong>{{ d.property_value }}</li></ul>"
	};
});
