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
		var falloutArray = [], 
		count, 
		hour;

		for (var i = 0; i < 24; i++) {
			count = 0;

			angular.forEach(data, function(x) {
				hour = x.creation_date.substring(11, 13);
				if (i == hour) {
					count++;
				} 
			});

			falloutArray.push(count);
		}

		return falloutArray;
	}

	service.getFieldData = function(data, field, filter) {
		var fieldArray = [],
		fieldItem;

		// populate array with error codes
		angular.forEach(data, function(x) {
			switch(field) {
				case "status":
					fieldItem = x.status;
					break;
				case "source_system":
					fieldItem = x.source_system;
					break;
				case "target_system":
					fieldItem = x.target_system;
					break;
				default:
					break;
			}

			if ((fieldArray.indexOf(fieldItem) == -1) && (fieldItem.includes(filter))) {
				fieldArray.push(fieldItem);
			}
		});

		return fieldArray.sort();
	}

	service.getCountsByCollection = function(data, collection, field) {
		var counts = [],
		count,
		fieldItem;

		angular.forEach(collection, function(x) {
			count = 0;

			angular.forEach(data, function(y) {
				switch(field) {
					case "status":
						fieldItem = y.status;
						break;
					case "source_system":
						fieldItem = y.source_system;
						break;
					case "target_system":
						fieldItem = y.target_system;
						break;
					default:
						break;
				}

				if (fieldItem == x) {
					count++;
				}
			});

			counts.push(count);
		});

		return counts;
	}

	service.get24hArray = function() {
		var hours = [],
		i;

		for (i = 0; i < 24; i++) {
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

		// TODO move to statistics ctrl
		$scope.barLabels = GraphData.get24hArray();
		$scope.barData = [GraphData.getFalloutsVsTime($scope.fallouts)];
		$scope.barSeries = ["Fallouts at this time"];

		// graph for source system data
		var sourceSystems = GraphData.getFieldData($scope.fallouts, "source_system", "");
		$scope.sourceSystemLabels = sourceSystems;
		$scope.sourceSystemData = GraphData.getCountsByCollection($scope.fallouts, sourceSystems, "source_system");

		 // init graph type as all
		$scope.statusGraphType = "all";
		
		// graph for all status data
		var statusesAll = GraphData.getFieldData($scope.fallouts, "status", "");
		$scope.statusAllLabels = statusesAll
		$scope.statusAllData = GraphData.getCountsByCollection($scope.fallouts, statusesAll, "status");
		
		// graph for closed status data
		var statusesClosed = GraphData.getFieldData($scope.fallouts, "status", "CLOSED");
		$scope.statusClosedLabels = statusesClosed;
		$scope.statusClosedData = GraphData.getCountsByCollection($scope.fallouts, statusesClosed, "status");
	}, function(response) { 
		// async error
	});
	
});

// controller for resolutions view
app.controller("resolutionsCtrl", function ($scope, FalloutData, GraphData) {
	// table sort data init
	$scope.sortType	= "id"; 		// set default sort type
	$scope.sortReverse = false;  	// set default sort order
	$scope.searchId = "";	 		// set default search/filter term

	// get fallout data from herokuapp api
	FalloutData.getData("https://comptel-api.herokuapp.com/api/resolutions")
	.then(function(response) { 
		// async success
		$scope.resolutions = response.data.docs;

		// graph for target system data
		var targetSystems = GraphData.getFieldData($scope.resolutions, "target_system", "");
		$scope.targetSystemLabels = targetSystems;
		$scope.targetSystemData = GraphData.getCountsByCollection($scope.resolutions, targetSystems, "target_system");

		// init graph type as all
		$scope.statusGraphType = "all";

		// graph for all status data
		var statusesAll = GraphData.getFieldData($scope.resolutions, "status", "");
		$scope.statusAllLabels = statusesAll
		$scope.statusAllData = GraphData.getCountsByCollection($scope.resolutions, statusesAll, "status");
		
		// graph for closed status data
		var statusesClosed = GraphData.getFieldData($scope.resolutions, "status", "CLOSED");
		$scope.statusClosedLabels = statusesClosed;
		$scope.statusClosedData = GraphData.getCountsByCollection($scope.resolutions, statusesClosed, "status");

		// graph for retry status data
		var statusesRetry = GraphData.getFieldData($scope.resolutions, "status", "RETRY");
		$scope.statusRetryLabels = statusesRetry;
		$scope.statusRetryData = GraphData.getCountsByCollection($scope.resolutions, statusesRetry, "status");
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