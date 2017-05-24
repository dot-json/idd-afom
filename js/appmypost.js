var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope) {
	$scope.statuses = [];

	$scope.addStatus = function (status) {
		$scope.statuses.unshift(status);
	};

	$scope.delStatus = function (idx) {
		$scope.statuses.splice(idx, 1);
	};
});
