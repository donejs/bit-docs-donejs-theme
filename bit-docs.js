var path = require("path");
var assign = require("./assign");

module.exports = function(bitDocs) {
  var pkg = require("./package.json");

  var dependencies = {};
  dependencies[pkg.name] = pkg.version;

  // add theme dependencies
  assign(dependencies, pkg.dependencies);

  bitDocs.register("html", {
    templates: path.join(__dirname, "templates"),
    dependencies: dependencies
  });
};


