module.exports = function Debounce(fn, wait){
    var debounce = false;
    var deferred = false;
    return function(){
        if(debounce){
          deferred = true;
          return;
        }
        debounce = true;
        setTimeout((function(){
            debounce = false;
            if(deferred){
                deferred = false;
                fn.apply(this, arguments);
            }
        }).bind(this), wait || 500);
        fn.apply(this, arguments);
    };
};