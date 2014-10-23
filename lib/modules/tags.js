var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	app.param('tag', function(req, res, next, id){
		res.bootstrap('tag_value', id);

		var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

		if(!checkForHexRegExp.test(id)){
			return next();
		}

		return app.model.Tag.findOne({ _id: id }).exec(function(err, tag){
			if(err) return next(err);
			if(tag){
				res.bootstrap('tag', tag);
			}
			return next();
		});

	});

	return njax_tags = {
		query:function(query, callback){
			if(!query){
				return callback(new Error("Not a valid query"));
			}else if(_.isString(query)){
				//Find all entities that match
				query = {
					type:query
				}
			}else if(_.isObject(query)){
				if(query._njax_type){
					var url_query = [];
					if(query.url){
						url_query.push(query.url);
					}
					if(query.api_url){
						url_query.push({ entity_url: query.api_url });
					}
					query = {
						entity_type:query._njax_type,

						$or:url_query

					}
				}

			}

			return app.model.Tag.find(query).exec(function(err, tags){
				if(err) return callback(err);

				//Now the tricky part - Populating the data.. or should we save that for an on tag basis
				return  callback(null, tags);

			});

		},
		add:function(tag_data, entity, callback){
			if(!entity._njax_type){
				return callback(new Error("Not a valid entity for tagging"));
			}
			var url = entity.api_url || entity.url;
			if(!url){
				return callback(new Error("Not a valid entity for tagging"));
			}
			if(_.isString(tag_data)){
				tag_data = {
					type:tag_data
				}
			}
			var tag = new app.model.Tag(tag_data);
			tag.entity_type = entity._njax_type;
			tag.entity_url = url;
			tag.save(callback);
			return tag;
		}
	}
}