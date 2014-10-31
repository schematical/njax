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
		queryTags:function(query, callback){
			app.model.Tag.find({

				value: { $regex: new RegExp('^' + query + '', 'i') }
			}, /*[], */ {'group': 'value'}, function(err, tags) {
				if(err) return callback(err);
				return callback(null, tags);
			});
		},
		query:function(query, callback){
			var tag_query = null;
			var entity_type = null;

			if(!query){
				return callback(new Error("Not a valid query"));
			}else if(_.isString(query)){
				//Find all entities that match
				//TODO Might want to move this to or

				return app.model.Tag.find({ value: query }).exec(function(err, tags){
					if(err) return callback(err);

					//Now the tricky part - Populating the data.. or should we save that for an on tag basis
					return  callback(null, tags);

				});

			}else if(_.isArray(query)){
				var tags = query;
				tag_query = [];
				for(var i in tags){
					tag_query.push({ value: tags[i] });
				}

			}else if(_.isObject(query)){
				if(query._njax_type){
					var entity = query;
					var url_query = [];
					if(query.url){
						url_query.push({ entity_url: entity.url });
					}
					if(query.api_url){
						url_query.push({ entity_url: entity.api_url });
					}
					entity_type = entity._njax_type
				}

			}
			query = { }
			if(entity_type && url_query){
				query.entity_type = entity_type;
				query.$or = url_query;
			}
			if(tag_value){
				query.tag_value = tag_value;
			}
			if(tag_query){
				query.$and = tag_query;
			}
			app.model.Tag.aggregate(
				{ $match:tag_query },
				{ $group: { _id: '$entity_url', match_count: { }}}
			)
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
			tag.entity_id = entity._id;
			tag.save(callback);
			return tag;
		}
	}
}