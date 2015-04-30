var async = require('async');
var _ = require('underscore');
var hjs = require('hjs');

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
		search_tpl:{},
		search_compiled_tpl:{},
		queryTags:function(query, callback){
			app.model.Tag.find(
				{ value: { $regex: new RegExp('^' + query + '', 'i') } },
				null,
				{'group': 'value'},
				function(err, tags) {
					if(err) return callback(err);
					return callback(null, tags);
				}
			);
		},
		query:function(query, callback){
			var tag_query = query.tag_query || null ;
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


			if(!tag_query){
				return app.model.Tag.find(query).exec(function(err, tags){

					if(err) return callback(err);

					//Now the tricky part - Populating the data.. or should we save that for an on tag basis
					return  callback(null, tags);

				});
			}
			query.$or = tag_query;




			//console.log("Query:", query);
			return app.model.Tag.aggregate(
				{ $match:query },
				{
					$group: {
						_id: {
							entity_url:'$entity_url',
							entity_type:'$entity_type',
							_entity_name: '$_entity_name',
							entity_id:'$entity_id',
							_entity_namespace:'$_entity_namespace'
						},

						values: { $push: "$_entity_name" },
						match_count: { $sum: 1  }
					}
				}
			).exec(function(err, tags){
				if(err) return callback(err);
				var rData = [];
				for(var i in tags){
					if(tags[i].match_count == tag_query.length){
						rData.push(tags[i]._id);
					}
				}
				//Now the tricky part - Populating the data.. or should we save that for an on tag basis
				return  callback(null, rData);//tags);//
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
			tag._entity_name = entity.name;
			tag._entity_namespace = entity.namespace;

			tag.save(callback);
			return tag;
		},
		registerSearchTpl:function(event, template){
			if(_.isArray(event)){
				for(var i in event){
					njax_tags.registerSearchTpl(event[i], template)
				}
				return;
			}
			njax_tags.search_tpl[event] = template;

		},

		render:function(event, req, res){
			var html = '';
			if(_.isArray(event)){
				for(var i in event){
					html += njax_tags.render(event[i], req, res);
				}
			}else{
				//Insert logic for event
				var partial = njax_tags.search_tpl[event.entity_type];
				/*console.log("Search: ", event.event_namespace, partial);*/
				if(!partial){//Its cool, just ignore it
					return '';
				}

				if(!njax_tags.search_compiled_tpl[partial]){
					var partial_loc = app.njax.setup_partials(partial);

					njax_tags.search_compiled_tpl[partial] = hjs.fcompile(partial_loc + '.hjs', { cache:true });
				}
				//TODO:Render it
				html += njax_tags.search_compiled_tpl[partial].render(event, res.locals.partials);
			}
			return html;
		}
	}
}