
var njax_api = require('./api');
var njax_broadcast = require('./broadcast');
var njax_tags = require('./tags');
var njax_events = require('./events');
var njax_subscription = require('./subscription');
var njax_widgets = require('./widgets');
module.exports = function(app){

    app.njax.api = njax_api(app);

    app.njax.broadcast = njax_broadcast(app);

	app.njax.tags = njax_tags(app);

	app.njax.events = njax_events(app);

	app.njax.widgets = njax_widgets(app);

	njax_subscription(app);
}