
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
					var q = req.query.q;

					if(!q){
						return next(new Error("Invalid Query"));
					}
					if(q.indexOf(',') !== -1){
						q = q.split(',');
					}

					return app.njax.tags.query(q, function(err, results){
						if(err) return next(err);
						res.bootstrap('search_results', results);
						return next();
					});

				},
				function(req, res, next){
					res.locals.search_html = app.njax.tags.render(req.search_results, req, res);
					res.render('search', req.search_results);
				}
			]);
			app.all(uri + '/tags', function(req, res, next){
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


					res.render('search', tags);
				});

			});
		}
	}
	return route;
}