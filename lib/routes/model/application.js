var async = require('async');
var _ = require('underscore');
module.exports = function(app){
    
        var route = require('./_gen/application.gen')(app);
    

    /**
     * Custom Code Goes here
     */
    route.read_query = route.owner_query = function(req){
        if(!req.user){
            return null;
        }
        return {
            //owner:req.user._id
        }
    };
	route.auth_update = function(req, res, next){
		if(req.user && req.user.is_admin){
			return next();
		}
		if(req.user && (req.application && (req.application.owner && req.application.owner.equals(req.user._id)) || (req.is_admin))){
			return  next();//We have a legit users
		}
		return next(new Error(404));//We do not have a legit user

	},
    route.bootstrap_edit = route.bootstrap_detail = function(req, res, next){

        var iframes = _.clone(app.njax.config.developers.iframes);
        for(var i in iframes){
            if(req.application && req.application.iframes/* && req.application.iframes[iframes[i]]*/  && req.application.iframes[iframes[i].namespace]){
                iframes[i].url = req.application.iframes[iframes[i].namespace].url
            }
        }
        res.bootstrap('iframes', iframes);
        return next();
    }
    route.pre_update_save = function(req, res, next){

        if(!req.application.iframes || _.isArray(req.application.iframes)){
            req.application.iframes = {};
        }
		if(req.body.iframes){
			//req.application.iframes = req.body.iframes;
			for(var i in req.body.iframes){
				if(req.body.iframes[i].url){
					req.application.iframes[req.body.iframes[i].namespace] = { url: req.body.iframes[i].url };
				}
			}
			console.log(req.application.iframes);
		}else{
			res.bootstrap('iframes', _.clone(app.njax.config.developers.iframes));
			for(var i in req.iframes){
				var url = req.body[req.iframes[i].namespace + '_iframe_url'];
				req.application.iframes[req.iframes[i].namespace] = { url:url };
			}
		}
        req.application.markModified('iframes');
        return next();
    }
    return route;

}