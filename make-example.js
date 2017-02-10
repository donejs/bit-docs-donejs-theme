var path = require("path");
var fs = require("fs-extra");
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
      "can": "2.3.28",
      "bit-docs-prettify": "^0.1.0",
      "bit-docs-html-highlight-line": "^0.2.2",
      "bit-docs-donejs-theme": __dirname,
      "bit-docs-html-toc": "^0.6.1"
    }
  },
  dest: path.join(__dirname, "site"),
  parent: "donejs",
  forceBuild: process.argv.includes("-f"),
  minifyBuild: false,
  debug: true
})
.then(function() {
  fs.copySync(
    path.join(__dirname, "static", "img"),
    path.join(__dirname, "site", "static", "img")
  );
})
.then(function() {
  console.log("DONE!");
})
.catch(function(error) {
  console.log("FAILED: ", error);
});
