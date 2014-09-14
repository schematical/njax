var njax_cp = require('./child_process/worker_manager');
var njax_api = require('./api');
var njax_broadcast = require('./broadcast');
module.exports = function(app){

    app.njax.auth = require('./auth')(app);

    app.njax.api = njax_api(app);
    app.njax.cp = njax_cp(app);
    app.njax.broadcast = njax_broadcast(app);
}