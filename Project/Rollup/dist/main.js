'use strict';

const a = 100;

const b = 200;

var name = "handwrite-rollup";
var version = "1.0.0";
var description = "";
var type = "module";
var main = "index.js";
var scripts = {
	build: "rollup -c ./rollup.config.js --watch",
	"build-ts": "rollup -c ./rollup.config.ts --configPlugin @rollup/plugin-typescript",
	"build-dev": "rollup -c ./rollup.config.js --environment FLAG,ENV:development",
	"build-prod": "rollup -c ./rollup.config.js --environment FLAG,ENV:production",
	"build-js": "node ./build/index.js"
};
var author = "";
var license = "ISC";
var devDependencies = {
	"@rollup/plugin-json": "^6.0.0",
	"@rollup/plugin-typescript": "^11.1.3",
	rollup: "^3.28.1"
};
var _package = {
	name: name,
	version: version,
	description: description,
	type: type,
	main: main,
	scripts: scripts,
	author: author,
	license: license,
	devDependencies: devDependencies
};

var pkg = /*#__PURE__*/Object.freeze({
  __proto__: null,
  author: author,
  default: _package,
  description: description,
  devDependencies: devDependencies,
  license: license,
  main: main,
  name: name,
  scripts: scripts,
  type: type,
  version: version
});

console.log(a + b);
console.log(100 + 200);
console.log(pkg);
//# sourceMappingURL=main.js.map
