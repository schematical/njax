
module.exports = function(app){
    
        var route = require('./_gen/requestCode.gen')(app);
    

    /**
     * Custom Code Goes here
     */
    return route;

}