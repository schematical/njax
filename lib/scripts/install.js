var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	return {
		isInstalled:function(cb){
			return app.model.Application.findOne({ namespace: app.njax.env_config.core.app, }).exec(function(err, application){
				if(err) return cb(err);
				return cb(null, !_.isNull(application) );
			});
		},
		exec: function (cb) {
			var defaultApp = new app.model.Application({
				namespace: app.njax.env_config.core.app,
				name: app.njax.env_config.core.app,
				app_url: 'http://' + app.njax.env_config.core.host
			})

			defaultApp.save(function (err) {
				if(err) return cb(err);
				return cb(null, defaultApp);
			});
		}
	}
}