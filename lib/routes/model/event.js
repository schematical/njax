
module.exports = function(app){
	return {
		extend: function (route) {


			/**
			 * Custom Code Goes here
			 */
			route.auth_event_hide = function (req, res, next) {
				if (req.user) {
					if (req.is_admin) {
						return next();
					}
					if (req.event.data.user && req.user._id.equals(req.event.data.user._id)) {
						return next();
					}
					/*for(var i in req.event.accounts){
					 if(req.event.accounts[i]._id == req.user._id){
					 return next();
					 }
					 }*/
				}
				return next(new Error(403));
			}

			var _init = route.init;
			route.init = function (uri) {

				if (!uri) uri = '/events';
				app.all(uri,
					[
						function (req, res, next) {
							return app.njax.events.query(req.query, function (err, events) {
								if (err) return next(err);
								res.bootstrap('events', events);
								return next();
							});
						},
						route.render_list
					]);
				_init(uri);
				app.all(uri + '/:event/hide', [
					route.auth_event_hide,
					function (req, res, next) {
						if (!req.event) {
							return next(new Error(404));
						}
						req.event.mutedDate = new Date();
						return req.event.save(function (err) {
							if (err) return next(err);
							return next();
						});
					},
					route.render_detail
				]);


			}
			return route;
		}
	}

}