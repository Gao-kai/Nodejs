const { series, src, dest } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const cssmin = require("gulp-cssmin");

function compile() {
  return src("./src/**/*.scss")
    .pipe(sass())
    .pipe(autoprefixer({}))
    .pipe(cssmin())
    .pipe(dest("./lib"));
}

function copyfont() {
  return src("./src/fonts/**").pipe(dest("./lib/fonts"));
}

module.exports = {
  build: series(compile, copyfont),
};
