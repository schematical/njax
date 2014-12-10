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
			query.mutedDate = null;

			return app.model.Event.find(query).sort({ 'creDate': -1 }).exec(function(err, events){
				if(err) return callback(err);

				return  callback(null, events);

			});

		},
		queryNewsfeed:function(data){
			if(!data){
				data = {};
			}
			//TODO: Paginate
			var query = data.query;
			if(!query){
				 query = {};
			}
			var EVENTS_PER_PAGE = data.events_per_page || 25;
			if(!data.query_extra){
				var query_extra = {
					limit:EVENTS_PER_PAGE,
					sort:{ 'creDate': -1 }
				}
			}
			if(data.page){
				query_extra.skip = data.page * EVENTS_PER_PAGE
			}
			if(!query.$and){
				query.$and = [];
			}
			query.mutedDate = null;

			var visible_event_query = [];
			for(var event_namespace in njax_events.event_tpl){
				visible_event_query.push({ event_namespace: event_namespace });
			}
			query.$and.push({ $or: visible_event_query });
			return app.model.Event.find(query, null, query_extra);
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
				}
				//TODO:Render it
				var _data = _.clone(event.data);
				_data._event = event.toObject();
				_data._can_hide = false;
				if(req.is_admin){
					_data._can_hide = true;
				}
				if(req.user && _data.user && (req.user._id == _data.user._id)){
					_data._can_hide = true;
				}
				html += njax_events.event_compiled_tpl[partial].render(_data, res.locals.partials);
			}
			return html;
		},
		config:function(config, val){
			if(_.isObject(config)){
				for(var i in config){
					njax_events.config(i, config);
				}
				return;
			}else if(_.isString(config) && val){
				switch(config){
					case('event_pre_save'):
						if(!_.isFunction(val)){
							throw new Error("Invalid njax.events.even_pre_save value. Must be function");
						}
						njax_events.event_pre_save = val;
						return;
					break;
				}
			}
			throw new Error("Invalid NJax-Events module Config Property: " + config);


		},
		event_pre_save:function(event, callback){
			return callback(null, event);
		}
	}
}