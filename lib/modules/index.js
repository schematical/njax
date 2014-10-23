
var njax_api = require('./api');
var njax_broadcast = require('./broadcast');
var njax_tags = require('./tags');
var njax_events = require('./events');
module.exports = function(app){

    app.njax.api = njax_api(app);

    app.njax.broadcast = njax_broadcast(app);

	app.njax.tags = njax_tags(app);

	app.njax.events = njax_events(app);
}