
module.exports = function(app){
    
     var route = require('./_gen/account.gen')(app);
	/*route.validate = function(req, res, next){
	    if(!req.application.widget)
	}*/

	/*route.populate = function(req, res, next, id){
		if(id == 'me' && req.user){
			res.bootstrap('account', req.user);
			return next();
		}
		var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

		var or_condition = []

		if(checkForHexRegExp.test(id)){
			or_condition.push({ _id:new ObjectId(id) });
		}

		or_condition.push({ namespace:id });

		if(or_condition.length == 0){
			return next();
		}
		var query = {
			$and:[
				{ $or: or_condition }


			]
		};
		app.model.Application.findOne(query, function(err, application){
			if(err){
				return next(err);
			}
			if(application){
				res.bootstrap('application', application);
			}
			return next();
		});



	}*/
	/*app.all('/accounts', [
		function(req, res, next){
			if(req.method == 'OPTIONS'){
				return res.send('yep');
			}
			console.log('req.is_admin', req.is_admin);
			if(!req.is_admin){
				return next(new Error(404));
			}
			return next();
		},
		app.njax.routes.account.populate_list_query,
		app.njax.routes.account.populate_list,
		app.njax.routes.account.bootstrap_list,
		app.njax.routes.account.render_list
	]);*/

    /**
     * Custom Code Goes here
     */
    return route;

}