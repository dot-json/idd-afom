var app = angular.module("myApp", []);
app.directive('ngMenu', function ($parse) {
	var linkFunction =  function (scope, element, attributes) {
		scope.items = scope.$eval(attributes.ngMenu);
	};
	return {
		restrict: 'A',
		link: linkFunction,
		template: '<div><ul data-ng-repeat="item in items"><li>{{item}}</li></ul></div>'
	};
});
