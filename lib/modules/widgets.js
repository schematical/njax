var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	app.njax.widgets = {
		widgets:[],
		refreshWidgets:function(next){
			app.model.Application.find({
				level:'SUPER',
				widgets: { $ne: null }
			}).exec(function(err, applications){
				if(err) throw err;
				async.eachSeries(
				    applications,
				    function(application, cb){
						app.njax.widgets.addWidget(/*{
							weight:10,
							src:[
								application.app_url + '/js/widgets.js',
								application.app_url + '/js/services/opportunity.js'
							],
							angular_directive:'oppertunityListWidget',
							//angular_ctl:'OpportunityListWidget',
							angular_modules:[
								'opp100.widgets'
							]
						}*/);
				        return cb();
				    },
				    function(errs){
				
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