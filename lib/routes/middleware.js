var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	app.use(function(req, res, next){
		res.bootstrap('_event_tpls', app.njax.events.event_tpl);
		res.bootstrap('_search_tpls', app.njax.tags.search_tpl);
		var super_applications = {};
		for(var i in app.njax.cache.super_applications){

			var data = app.njax.cache.super_applications[i].bootstrap_data;
			if(!data || !_.isObject(data)){
				data  = {};
			}
			data.app_url = app.njax.cache.super_applications[i].app_url;
			super_applications[app.njax.cache.super_applications[i].namespace ] = data;
		}
		res.bootstrap('super_applications', super_applications);
		return next();
	});
}