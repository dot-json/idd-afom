// the application
var app = angular.module("myApp", ["ngRoute", "chart.js"]);

// config views
app.config(function ($routeProvider, $locationProvider) {
	$locationProvider.hashPrefix("!");

	// routes
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
		.otherwise ({ // default
			redirectTo: "404" 
		});
});

app.factory("FalloutData", function($http) {
	var service = {};

	service.getData = function(query) {
		return $http.get(query);
	};

	return service;
});

app.factory("GraphData", function() {
	var service = {};

	service.getFalloutsVsTime = function(data) {
		var falloutArray = [];

		for (var i = 0; i < 24; i++) {
			var count = 0;

			angular.forEach(data, function(value, key) {
				var hour = value.creation_date.substring(11, 13);
				if (i == hour) {
					count++;
				} 
			});

			falloutArray.push(count);
		}

		return falloutArray;
	}

	service.get24h = function(data) {
		var hours = [];

		for (var i = 0; i < 24; i++) {
			if (i == 0) {
				hours.push("12am");
			} else if (i < 12) {
				hours.push(i + "am");
			} else if (i == 12) {
				hours.push("12pm");
			} else {
				hours.push((i - 12) + "pm");
			}
		}

		return hours;
	}

	return service;
});

app.controller("mainCtrl", function ($scope) {

});

// controller for fallouts view
app.controller("falloutsCtrl", function ($scope, FalloutData, GraphData) {
	// table sort data init
	$scope.sortType	= "id"; 		// set default sort type
	$scope.sortReverse = false;		// set default sort order
	$scope.searchId = "";	 		// set default search/filter term

	// chart data
	$scope.falloutsPerDay = [];
	
	FalloutData.getData("https://comptel-api.herokuapp.com/api/fallouts")
	.then(function(response) {
		// async success
		$scope.fallouts = response.data.docs;
		console.log(GraphData.getFalloutsVsTime($scope.fallouts));

		$scope.labels = GraphData.get24h();
		$scope.data = [GraphData.getFalloutsVsTime($scope.fallouts)];
		$scope.series = ["Fallouts at this time"];
	}, function(response) { 
		// async error
	});

	//bullshet
	
});

// controller for resolutions view
app.controller("resolutionsCtrl", function ($scope, $http) {
	// table sort data init
	$scope.sortType	= "id"; 		// set default sort type
	$scope.sortReverse = false;  	// set default sort order
	$scope.searchId = "";	 		// set default search/filter term

	// get fallout data from herokuapp api
	$http.get("https://comptel-api.herokuapp.com/api/resolutions")
	.then(function(response) { 
		// async success
		$scope.resolutions = response.data.docs;
	}, function(response) { 
		// async error
	});


});

// directive for listing additional details based on fallout id
app.directive("ngDetails", function ($parse, $http) {
	var linkFunction = function (scope, element, attributes) {
		// create GET query for the api
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

// TODO
// formats datetime as "yyyy-mm-dd hh-mm-ss"
app.filter('split', function() {
	return function(input, splitChar, splitIndex) {
		return input.split(splitChar)[splitIndex];
	}
});