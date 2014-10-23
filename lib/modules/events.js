var async = require('async');
var _ = require('underscore');
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

		}
	}
}