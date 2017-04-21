module.exports = function(docMap, options, getCurrent, helpers, OtherHandlebars){
    return {
        getCurrentYear: function(){
            return new Date().getFullYear();
        }
    };
};
