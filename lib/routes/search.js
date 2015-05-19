var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	var route = app.njax.routes.search = {
		init:function(uri){
			if(!uri){
				uri =  '/search'
			}
			app.all(uri,
				[function(req, res, next){
					//Searches by tags
					var entityType = req.query.entity_type;
					var q = req.query.q || req.query.tags;


					if(!q){
						req.search_results = [];
						return next();
						//return next(new Error("Invalid Query"));
					}
					if(q.indexOf(',') !== -1){
						q = q.split(',');
					}

					return app.njax.tags.query(q, function(err, results){
						if(err) return next(err);
						var search_results = [];
						async.eachSeries(
						    results,
						    function(result, cb){
						        return result.getEntity(function(err, entity){

									if(err) return next(err);

									if(!entity){
										return cb();
									}
									var result_data = result.toObject();
									result_data.entity = entity.toObject();
									search_results.push(result_data)
									return cb();
								})

						    },
						    function(errs){
								/*console.log("SEarchNResults:", search_results.length);*/
								res.bootstrap('search_results', search_results);

								return next();
						    }
						)

					});

				},
				function(req, res, next){
					res.locals.search_html = app.njax.tags.render(req.search_results, req, res);
					return next();
				},
				route.render_search
			]);
			app.all(uri + '/tags', [
				function(req, res, next){
					//Searches by tags
					var q = req.query.q;

					if(!q){
						return next(new Error("Invalid Query"));
					}
					if(q.indexOf(',') !== -1){
						q = q.split(',');
					}

					return app.njax.tags.queryTags(q, function(err, tags){
						if(err) return next(err);
						res.bootstrap('tags', tags);
						return next();

					});

				},
				route.render_search
			]);

		},
		render_search:function(req, res, next){

			res.render('search', req.search_results || req.tags || null);
		}
	}
	return route;
}