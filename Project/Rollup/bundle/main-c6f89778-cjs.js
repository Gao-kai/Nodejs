'use strict';

const b = 200;

var version = "1.0.0";

Promise.resolve().then(function () { return require('./a-42c32546.js'); }).then((res) => {
  console.log(res);
});

// console.log(a + b);
console.log(100 + 200);
console.log(version);

exports.b = b;
exports.version = version;
