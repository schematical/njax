var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	app.njax.widgets = {
		widgets:[],
		refreshWidgets:function(next){

			app.njax.widgets.widgets = [];
			app.model.Application.find({
				level:'SUPER',
				widgets: { $ne: null }
			}).exec(function(err, applications){
				if(err) throw err;

				async.eachSeries(
				    applications,
				    function(application, cb){
						if(!application.widgets){
							throw new Error("THis shouldnt happen, optimize query");
							return cb();
						}

						for(var i in application.widgets) {
							var widget = _.clone(application.widgets[i]);
							for(var ii in widget.src){
								if(widget.src[ii].indexOf('//') == -1){
									widget.src[ii] =  ((application.bootstrap_data && application.bootstrap_data.asset_url) || application.app_url) + widget.src[ii]
								}
							}
							app.njax.widgets.addWidget(widget);
						}
				        return cb();
				    },
				    function(errs){
						if(next){
							return next();
						}
				    }
				)

			});
		},
		addWidget:function(data){
			if(!data.src){
				//throw new Error("Need a valid src");
				data.src = [];
			}else if(!_.isArray(data.src)){
				data.src = [data.src];
			}

			for(var i in data.src){
				if(_.isString(data.src[i])){
					data.src[i] = { src: data.src[i] };
				}
			}
			if(!data.angular_ctl && !data.angular_directive){
				throw new Error("NJax-Widgets Need a valid ctl - directive");
			}

			if(!data.angular_modules){
				data.angular_modules = [];
			}
			app.njax.widgets.widgets.push(data);
		},
		middleware:function(){
			//TODO: Eventually shuffle or soemthing based off of what is passed in here
			//Order by weight?
			return function(req, res, next){

				res.bootstrap('_njax_widgets', app.njax.widgets.widgets);
				return next();
			}
		}
	}
	return app.njax.widgets;
}