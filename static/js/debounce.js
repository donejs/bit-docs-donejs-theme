module.exports = function Debounce(fn, wait){
    var self = this;
    this.debounce = false;
    this.deferred = false;
    return function(){
        if(self.debounce){
          self.deferred = true;
          return;
        }
        self.debounce = true;
        setTimeout((function(){
            self.debounce = false;
            if(self.deferred){
                self.deferred = false;
                fn.apply(this, arguments);
            }
        }).bind(this), wait || 500);
        fn.apply(this, arguments);
    };
};