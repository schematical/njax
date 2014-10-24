var async = require('async');
var _ = require('underscore');
var hjs = require('hjs');

module.exports = function(app){
	app.param('event', function(req, res, next, id){

		var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
		if(!checkForHexRegExp.test(id)){
			return next();
		}
		return app.model.Event.findOne({ _id: id }).exec(function(err, event){
			if(err) return next(err);
			if(event){
				res.bootstrap('event', event);
			}
			return next();
		});

	});

	return njax_events = {
		event_tpl:{},
		event_compiled_tpl:{},
		query:function(query, callback){
			if(!query){
				return callback(new Error("Not a valid query"));
			}else if(_.isObject(query)){
				if(query._njax_type){
					var url_query = [];
					if(query.url){
						url_query.push({ entity_url: query.url });
					}
					if(query.api_url){
						url_query.push({ entity_url: query.api_url });
					}
					query = {/*
						entity_type:query._njax_type,*/
						$or:url_query
					}
				}

			}
			console.log(query);

			return app.model.Event.find(query).exec(function(err, events){
				if(err) return callback(err);

				return  callback(null, events);

			});

		},
		registerEventTpl:function(event, template){
			if(_.isArray(event)){
				for(var i in event){
					njax_events.registerEventTpl(event[i], template)
				}
				return;
			}
			njax_events.event_tpl[event] = template;

		},

		render:function(event, req, res){
			var html = '';
			if(_.isArray(event)){
				for(var i in event){
					html += njax_events.render(event[i], req, res);
				}
			}else{
				//Insert logic for event
				var partial = njax_events.event_tpl[event.event_namespace];
				if(!partial){//Its cool, just ignore it
					return '';
				}
				if(!njax_events.event_compiled_tpl[partial]){
					var partial_loc = app.njax.setup_partials(partial);

					njax_events.event_compiled_tpl[partial] = hjs.fcompile(partial_loc + '.hjs', { cache:true });
					console.log(njax_events.event_compiled_tpl[partial]);
				}
				//TODO:Render it
				html += njax_events.event_compiled_tpl[partial].render(event.data, res.locals.partials);
			}
			return html;
		}
	}
}