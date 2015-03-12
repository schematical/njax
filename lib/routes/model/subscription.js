
module.exports = function(app){
    
	var route = require('./_gen/subscription.gen')(app);

route.bootstrap_list = [
	function(req, res, next){

		res.locals.subscriptions_html = app.njax.tags.render(res.locals.subscriptions, req, res);
		return next();
	},
];







	app.post('/subscriptions', [
		function(req, res, next){

			if(!req.body.account){

				if(req.user){
					req.bootstrap('account', req.user);
					return next();
				}
				return next(new Error("Need an account"));
			}else{
				if(!req.active_application || req.active_application.level != 'SUPER'){
					//Then were not legit
					return next(new Error("This application does not have sufficent privledges to subscribe users to things"))
				}
			}
			if(req.body.account._id){
				res.bootstrap('account', req.body.account);
				return next();
			}
			return app.model.Account.findOne(
				{ _id: req.body.account },
				function(err, account){
					if(err) return next(err);
					if(!account){
						return next(new Error("Invalid Account"));
					}
					res.bootstrap('account', account);
					return next();
				}
			)

		},
		function(req, res, next){

			app.njax.subscription.add(req.account, req.body.entity, null, function(err, subscription){
				if(err) return next(err);
				res.bootstrap('subscription', subscription);
				return next();
			});
		},
		route.render_detail
	]);
	app.get('/subscriptions', [
		function(req, res, next){
			if(!req.query.entity_url){
				return next(new Error("This route is not setup to work with out 'entity_url'"));
			}
			var query = {
				entity_url:req.query.entity_url
			}
			if(req.query._njax_type){
				query._njax_type = req.query._njax_type;
			}
			console.log("Subscriptions Route: Firing off");
			app.njax.subscription.query(query, function(err, subscriptions){
				if(err) return next(err);
				res.bootstrap('subscriptions', subscriptions);
				return next();
			});
		},

		route.render_list
	]);

	app.delete('/subscriptions/:subscription', [
		function(req, res, next){
			if(!req.user){
				return next(new Error(403));
			}
			if(!req.subscription){
				return next(new Error(404));
			}
			if(!req.user._id.equals(req.subscription.account)){
				return next(new Error(403));//They shouldnt be viewing this
			}
			return req.subscription.remove(function(err){
				if(err) return next(err);
				return next();
			});

		},
		route.render_detail
	]);


	return route;



}