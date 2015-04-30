var async = require('async');
var _ = require('underscore');
var fs = require('fs');

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

		res.bootstrap('tag_options', app.njax.config.developers.tag_options);


        res.bootstrap('iframes', app.njax.config.developers.iframes);

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

        /*if(!req.application.iframes || _.isArray(req.application.iframes)){
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
*/

		if(!req.application.secret || req.application.secret.length == 0){
			req.application.secret = app.njax.helpers.uid(128);
		}

        return next();
    }



	var app_json_loc = app.njax.config.app_dir  + '/apps.json';
	var getAppJson = function(){

		if(!fs.existsSync(app_json_loc)){
			return {};
		}
		return JSON.parse(fs.readFileSync(app_json_loc));
	}
	app.all('/apps/:application/export', [
		function(req, res, next) {
			//Load all apps
			console.log("Hit some how");
			if(!req.is_admin){
				return next(new Error(403));
			}
			var data = getAppJson();

			data[req.application.namespace] = req.application.toObject();
			delete(data[req.application.namespace].__v);
			delete(data[req.application.namespace]._id);
			delete(data[req.application.namespace].owner);

			var json_data = JSON.stringify(data);
			fs.writeFileSync(app_json_loc, json_data);
			return next();

		},
		function(req, res, next){
			return res.send("FInished Export");
		}

	]);

	var uri = app.njax.config.admin_uri;

	app.all(uri + '/import_apps', [
		function(req, res, next) {
			if(req.query.namespace){
				return next();
			}

			var data = getAppJson();
			var applications = [];
			for(var i in data){
				applications.push(data[i]);
			}
			res.bootstrap('applications', applications);
			return res.render('admin/applications');

		},
		function(req, res, next){

			var data = getAppJson();
			if(!data[req.query.namespace]){
				return next(new Error("No app found with that namespace"));
			}
			var application_data = data[req.query.namespace];
			return app.model.Application.findOne({namespace: application_data.namespace}, function (err, application) {
				if (err) return next(err);
				if(!application){
					application = new app.model.Application({});
				}
				for(var i in application_data){
					application[i] = application_data[i];
				}
				application.owner = req.user._id;
				res.bootstrap('application', application);
				return application.save(function(err) {
					if (err) return next(err);
					return next();
				});
			});

		},
		function(req, res, next){
			return res.redirect('//' + req.application.url + '?message=import_successful');
		}
	]);

	return route;
}