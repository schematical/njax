
module.exports = function(app){
    
        var route = require('./_gen/subscription.gen')(app);
    

    /**
     * Custom Code Goes here
     */
    route.init();

}