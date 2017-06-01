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

			angular.forEach(data, function(x) {
				var hour = x.creation_date.substring(11, 13);
				if (i == hour) {
					count++;
				} 
			});

			falloutArray.push(count);
		}

		return falloutArray;
	}

	service.getStatusData = function(data) {
		var errorCodes = [];

		// populate array with error codes
		angular.forEach(data, function(x) {
			var code = x.status;

			if (errorCodes.indexOf(code) == -1) {
				errorCodes.push(code);
			}
		});

		return errorCodes.sort();
	}

	service.getSystemData = function(data) {
		var errorCodes = [];

		// populate array with error codes
		angular.forEach(data, function(x) {
			var code = x.source_system;

			if (errorCodes.indexOf(code) == -1) {
				errorCodes.push(code);
			}
		});

		return errorCodes.sort();
	}

	service.getFalloutsByStatus = function(data, collection) {
		var counts = [];

		angular.forEach(collection, function(x) {
			var count = 0;

			angular.forEach(data, function(y) {
				if (y.status == x) {
					count++;
				}
			});

			counts.push(count);
		});

		return counts;
	}

	service.getFalloutsBySystem = function(data, collection) {
		var counts = [];

		angular.forEach(collection, function(x) {
			var count = 0;

			angular.forEach(data, function(y) {
				if (y.source_system == x) {
					count++;
				}
			});

			counts.push(count);
		});

		return counts;
	}

	service.get24hArray = function() {
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

		$scope.barLabels = GraphData.get24hArray();
		$scope.barData = [GraphData.getFalloutsVsTime($scope.fallouts)];
		$scope.barSeries = ["Fallouts at this time"];

		$scope.doughnut1Labels = GraphData.getStatusData($scope.fallouts);
		$scope.doughnut1Data = GraphData.getFalloutsByStatus($scope.fallouts, GraphData.getStatusData($scope.fallouts));

		$scope.doughnut2Labels = GraphData.getSystemData($scope.fallouts);
		$scope.doughnut2Data = GraphData.getFalloutsBySystem($scope.fallouts, GraphData.getSystemData($scope.fallouts));
	}, function(response) { 
		// async error
	});
	
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