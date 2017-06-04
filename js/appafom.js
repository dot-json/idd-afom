// the application
var app = angular.module("myApp", ["ngRoute", "chart.js"]);

// config views
app.config(function ($routeProvider, $locationProvider) {
	$locationProvider.hashPrefix("");

	// routes
	$routeProvider
		.when("/", {
			controller	: "dashboardCtrl",
			templateUrl	: "templates/dashboard.html",
			activetab 	: 'dashboard'
		})
		.when("/fallouts", {
			controller	: "falloutsCtrl",
			templateUrl	: "templates/fallouts.html",
			activetab: 'fallouts'
		})
		.when("/resolutions", {
			controller	: "resolutionsCtrl",
			templateUrl	: "templates/resolutions.html",
			activetab: 'resolutions'
		})
		.when("/404", {
			templateUrl	: "templates/404.html",
			activetab: '404'
		})
		.otherwise ({ // default
			redirectTo	: "404" 
		});
});

// factory for graph related data
app.factory("GraphData", function() {
	var service = {};

	service.getFalloutsVsTime = function (data) {
		var falloutArray = [], 
		count, 
		hour;

		for (var i = 0; i < 24; i++) {
			count = 0;

			angular.forEach(data, function (x) {
				hour = x.creation_date.substring(11, 13);
				if (i == hour) {
					count++;
				} 
			});

			falloutArray.push(count);
		}

		return falloutArray;
	}

	// return array of all values of a specific field in a json array, based on a filter
	service.getFieldData = function (data, field, filter) {
		var fieldArray = [],
		fieldItem;

		// populate array with error codes
		angular.forEach(data, function (x) {
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

	service.getCountsByCollection = function (data, collection, field) {
		var counts = [],
		count,
		fieldItem;

		angular.forEach(collection, function (x) {
			count = 0;

			angular.forEach(data, function (y) {
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

	return service;
});

app.factory("TimeFormat", function ($http) {
	var service = {};

	// return array of hours in a day in 12-hour format
	service.get24hArray = function () {
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

app.controller("mainCtrl", function ($scope, $route) {
});

// controller for fallouts view
app.controller("falloutsCtrl", function ($scope, $route, $http, GraphData) {
	// store route data for navbar config
	$scope.activeTab = $route.current.activetab;

	// table sort data init
	$scope.sortType	= "id"; 		// set default sort type
	$scope.sortReverse = false;		// set default sort order
	$scope.searchId = "";	 		// set default search/filter term
	
	// get fallout data from herokuapp api
	$http.get("https://comptel-api.herokuapp.com/api/fallouts")
	.then(function (response) {
		// async success
		$scope.fallouts = response.data.docs;

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
	}, function (response) { 
		// async error
	});
});

// controller for resolutions view
app.controller("resolutionsCtrl", function ($scope, $route, $http, GraphData) {
	// store route data for navbar config
	$scope.activeTab = $route.current.activetab;

	// table sort data init
	$scope.sortType	= "id"; 		// set default sort type
	$scope.sortReverse = false;  	// set default sort order
	$scope.searchId = "";	 		// set default search/filter term

	// get resolution data from herokuapp api
	$http.get("https://comptel-api.herokuapp.com/api/resolutions")
	.then(function (response) { 
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
	}, function (response) { 
		// async error
	});
});

// controller for dashboard view
app.controller("dashboardCtrl", function ($scope, $route, $http, GraphData, TimeFormat) {
	// store route data for navbar config
	$scope.activeTab = $route.current.activetab;

	// get fallout data from herokuapp api
	$http.get("https://comptel-api.herokuapp.com/api/fallouts")
	.then(function (falloutResponse) {
		// async success
		$scope.fallouts = falloutResponse.data.docs;

		// get resolution data from herokuapp api
		$http.get("https://comptel-api.herokuapp.com/api/resolutions")
		.then(function (resolutionResponse) { 
			// async success
			$scope.resolutions = resolutionResponse.data.docs;

			// quantity data
			$scope.falloutCount = $scope.fallouts.length;
			$scope.resolutionCount = $scope.resolutions.length;

			var retryCount = 0, 
			retrySuccessCount = 0;

			angular.forEach($scope.resolutions, function (x) {
				if (x.status.includes("RETRY")) {
					retryCount++;

					if (x.status.includes("SUCCESS")) {
						retrySuccessCount++;
					}
				}
			});

			$scope.retrySuccessRate = retrySuccessCount * 100 / retryCount;

			// graph for frequency data
			$scope.freqLabels = TimeFormat.get24hArray();
			$scope.freqSeries = ["Fallouts at this time", "Resolutions at this time"];
			$scope.freqData = [
				GraphData.getFalloutsVsTime($scope.fallouts),
				GraphData.getFalloutsVsTime($scope.resolutions)
			];
		}, function (resolutionResponse) { 
			// async error
		});
	}, function (falloutResponse) { 
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

// formats datetime as "yyyy-mm-dd hh-mm-ss"
app.filter('splitDateTime', function() {
	return function (toConvert) {
		return toConvert.substring(0, 10) + " " + toConvert.substring(11, 19);
	};
});