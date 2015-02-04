
module.exports = function(app){
    
	var route = require('./_gen/subscription.gen')(app);
    
	return route;



}