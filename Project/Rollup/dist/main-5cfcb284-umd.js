(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	const a = 100;

	const b = 200;

	console.log(a + b);
	console.log(100 + 200);

}));
