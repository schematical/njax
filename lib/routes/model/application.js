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

		if(req.user && req.application && req.application.owner && (req.application.owner.equals(req.user._id))){
			res.bootstrap('is_owner', true);
		}else{
			res.bootstrap('is_owner', false);
		}

		return next();
    }
	var _auth_update = route.auth_update;
	route.auth_update = function(req, res, next){
		return _auth_update(req, res, function(err){
			if(err) return next(err);
			if(req.is_admin) {
				return next();
			}
			//Look for fields that they should not be albe to set
			if(req.body.secret){
				delete(req.body.secret);
			}
			if(req.body.level){
				delete(req.body.level);
			}
			return next();
		})
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
		}else{
			res.bootstrap('iframes', _.clone(app.njax.config.developers.iframes));
			for(var i in req.iframes){
				var url = req.body[req.iframes[i].namespace + '_iframe_url'];
				req.application.iframes[req.iframes[i].namespace] = { url:url };
			}
		}
        req.application.markModified('iframes');


		if(!req.application.secret || req.application.secret.length == 0){
			req.application.secret = app.njax.helpers.uid(128);
		}

        return next();
    }
    return route;

}