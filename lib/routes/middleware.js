
module.exports = function(app){
	app.use(function(req, res, next){
		res.bootstrap('_event_tpls', app.njax.events.event_tpl);
		return next();
	});
}