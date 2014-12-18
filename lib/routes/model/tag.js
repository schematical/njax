
module.exports = function(app){
    
        var route = require('./_gen/tag.gen')(app);


    /**
     * Custom Code Goes here
     */
	route.remove_tag = function(req, res, next){
		if(!req.tag){
			return next(new Error(404));
		}
		return req.tag.remove(function(err){
			if(err) return next(err);
			return next();
		});
	}

	var _init = route.init;
	route.init = function(uri){
		if(!uri) uri = '/tags';
		app.delete(uri +  '/:tag',[
			function(req, res, next){
				if(!req.tag){
					return next(new Error(404));
				}
				return next();
			},
			route.auth_update,
			route.remove_tag,
			route.broadcast_update,
			route.render_detail
		]);
		_init(uri);

	}
    return route;

}