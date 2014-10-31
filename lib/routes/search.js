
module.exports = function(app){
	app.all('/search', function(req, res, next){
		//Searches by tags
		var entityType = req.query.entity_type;
		var value = req.query.q;
		app.njax.tags.queryTags(value, function(err, tags){
			if(err) return next(err);
			res.render('search', tags);
		});

	});
}