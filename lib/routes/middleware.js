
module.exports = function(app){
	app.use(function(req, res, next){
		res.bootstrap('_event_tpls', app.njax.events.event_tpl);
		var super_applications = {};
		for(var i in app.njax.cache.super_applications){
			super_applications[app.njax.cache.super_applications[i].namespace ] = {
				app_url:app.njax.cache.super_applications[i].app_url
			}
		}
		res.bootstrap('super_applications', super_applications);
		return next();
	});
}