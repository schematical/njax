var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	app.njax.widgets = {
		widgets:[],

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
			if(!data.angular_ctl){
				throw new Error("NJax-Widgets Need a valid src");
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