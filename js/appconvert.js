var app = angular.module("myApp", []);
app.filter("toRoman", function () {
	return function (toConvert) {
		var i, output	= "",
			decimals	= [90, 50, 40, 10, 9, 5, 4, 1],
			romans		= ["XC", "L", "XL", "X", "IX", "V", "IV", "I"];

		if (toConvert > 99) {
			output = "not supported";
		} else {
			for (i = 0; i < decimals.length; i++) {
				while (decimals[i] <= toConvert) {
					output += romans[i];
					toConvert -= decimals[i];
				}
			}
		}

		return output;
	};
});
