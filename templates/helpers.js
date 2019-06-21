var path = require("path");
var unescapeHTML = require("unescape-html");

module.exports = function(docMap, options, getCurrent, helpers, OtherHandlebars){
    var docMapInfo = new DocMapInfo(docMap, getCurrent);

    return {
        getCurrentYear: function(){
            return new Date().getFullYear();
        },
        getLinkTitle: function(docObject) {
          var description = docObject.description || docObject.name;
          description = helpers.stripMarkdown(description);
          return unescapeHTML(description).replace(/\n/g, " ").trim();
        },
        getDocumentTitle: function(docObject){
          var title = docMapInfo.getTitle(docObject) || 'DoneJS';
          if (docObject.name === 'donejs' || (title && title.toLowerCase() === 'donejs')) {
              return 'DoneJs';
          }
          return 'DoneJS - ' + title;
        }
    };
};

var DocMapInfo = function(docMap, getCurrent) {
    this.docMap = docMap;
    this.childrenMap = makeChildrenMap(docMap);
    this.getCurrent = getCurrent;
};
DocMapInfo.prototype.isCurrent = function(docObject){
    return docObject.name === this.getCurrent().name;
};
DocMapInfo.prototype.hasCurrent = function(docObject){
    var parents = this.getParents(this.getCurrent());
    parents.push(this.getCurrent());
    var itemMap = {};
    parents.forEach(function(docObject){
        itemMap[docObject.name] = true;
    });

    return itemMap[docObject.name];
};
DocMapInfo.prototype.hasOrIsCurrent = function(docObject){
    return this.isCurrent(docObject) || this.hasCurrent(docObject);
};
DocMapInfo.prototype.getParents = function(docObject, cb){
    var names = {};

  // walk up parents until you don't have a parent
  var parent = this.docMap[docObject.parent],
    parents = [];
    if(!parent) {
        return [];
    }
  // don't allow things that are their own parent
  if(parent.parent === docObject.name){
    return parents;
  }

  while(parent){
        if(cb) {
            cb(parent);
        }
    parents.unshift(parent);
    if(names[parent.name]){
      return parents;
    }
    names[parent.name] = true;
    parent = this.docMap[parent.parent];
  }
  return parents;
};
DocMapInfo.prototype.getTitle = function(docObject) {
    return docObject.title || docObject.name;
};

function getShortTitle(name, parent){
    if(parent && (parent.type === "module" || parent.type === "group")) {
        var modeletName = path.dirname(parent.name),
            moduleName = path.basename(parent.name);

        if(name.indexOf( parent.name+"/" ) === 0 ) {
            name = name.replace(parent.name+"/", "./");
        }
        // can-util/dom/events/attributes/attributes's parent is can-util/dom/events/events
        else if( moduleName && modeletName.endsWith(moduleName) && name.indexOf( modeletName+"/" ) === 0  ) {
            name = name.replace(modeletName+"/", "./");
        }
        else {
            return;
        }

        var basename = path.basename(name);
        if(name.endsWith("/"+basename+"/"+basename)) {
            return path.dirname(name)+"/";
        } else {
            return name;
        }
    }
}
DocMapInfo.prototype.getShortTitle = function(docObject) {

    if(docObject.type === "module") {
        var parents = this.getParents(docObject).reverse();

        var parentModule = parents.find(function(docObject){
            return docObject.type === "module";
        });
        var parentGroup = parents[0] && parents[0].type === "group" && parents[0];

        var name = docObject.name,
            shortTitle;

        if(parentGroup) {
            shortTitle = getShortTitle(name, parentGroup);
            if(shortTitle) {
                return shortTitle;
            }
        }

        if(parentModule) {
            shortTitle = getShortTitle(name, parentModule);
            if(shortTitle) {
                return shortTitle;
            }
        }
        return name;
    } else {
        return this.getTitle(docObject);
    }

};
DocMapInfo.prototype.isGroup = function(docObject) {
    return ["group","static","prototype"].indexOf(docObject.type) !== -1;
};
DocMapInfo.prototype.getCurrentTree = function(){
    // [{docObject, children<>},{docObject}]
    //
    var getChildren = this.getChildren.bind(this),
        getNestedDocObject = this.getNestedDocObject.bind(this);

    var cur = this.getCurrent();

    var curChildren = this.getNestedChildren(cur);

    this.getParents(cur, function(docObject){
        curChildren = getChildren(docObject).map(function(docObject){
            if(docObject.name === cur.name) {
                return {docObject: docObject, children: curChildren};
            } else {
                return getNestedDocObject(docObject);
            }
        });
        cur = docObject;
    });

    if(!curChildren) {
        return {children: []};
    } else {
        return {children: curChildren};
    }
};
DocMapInfo.prototype.getChildren = function(docObject){
    var children = this.childrenMap[docObject.name];
    return (children || []).sort(compareDocObjects);
};
DocMapInfo.prototype.getNestedDocObject = function(docObject){
    if(this.isGroup(docObject)) {
        return {
            docObject: docObject,
            children: this.getNestedChildren(docObject)
        };
    } else {
        return {docObject: docObject};
    }
};
DocMapInfo.prototype.getNestedChildren = function(docObject){
    return this.getChildren(docObject).map(this.getNestedDocObject.bind(this));
};

var levelMap = ["collection","modules"];

function makeChildrenMap(docMap){
    var childrenMap = {};
    for(var name in docMap) {
        var docObject = docMap[name];
        var parent = docObject.parent;
        if(parent) {
            if(!childrenMap[parent]) {
                childrenMap[parent] = [];
            }
            childrenMap[parent].push(docObject);
        }
    }
    return childrenMap;
}


var compareDocObjects = function(child1, child2){

  // put groups at the end
  if(/group|prototype|static/i.test(child1.type)){
    if(!/group|prototype|static/i.test(child2.type)){
      return 1;
    } else {
      if(child1.type === "prototype"){
        return -1;
      }
      if(child2.type === "prototype"){
        return 1;
      }
      if(child1.type === "static"){
        return -1;
      }
      if(child2.type === "static"){
        return 1;
      }

    }
  }
  if(/prototype|static/i.test(child2.type)){
    return -1;
  }

  if(typeof child1.order === "number"){
    if(typeof child2.order === "number"){
      // same order given?
      if(child1.order == child2.order){
        // sort by name
        if(child1.name < child2.name){
          return -1;
        }
        return 1;
      } else {
        return child1.order - child2.order;
      }

    } else {
      return -1;
    }
  } else {
    if(typeof child2.order === "number"){
      return 1;
    } else {
      // alphabetical
      if(child1.name < child2.name){
        return -1;
      }
      return 1;
    }
  }
};
