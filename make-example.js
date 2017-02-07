var fs = require("fs");
var path = require("path");
var generate = require("bit-docs-generate-html/generate");

var docMap = new Promise(function(resolve, reject) {
  var filePath = path.join(__dirname, "docMap.json");

  fs.readFile(filePath, function(err, data) {
    if (err) return reject(err);

    resolve(JSON.parse(data.toString()));
  });
});

generate(docMap, {
  html: {
    templates: path.join(__dirname, "templates"),
    dependencies: {
      "bit-docs-donejs-theme": __dirname
    }
  },
  dest: path.join(__dirname, "site"),
  parent: "donejs",
  forceBuild: process.argv.includes("-f"),
  minifyBuild: false,
  debug: true
}).catch(function(error) {
  console.error(error);
});
