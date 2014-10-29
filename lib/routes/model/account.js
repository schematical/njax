
module.exports = function(app){
    
     var route = require('./_gen/account.gen')(app);
    

    /**
     * Custom Code Goes here
     */
    return route;

}