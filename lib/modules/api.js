var oauth2orize = require('oauth2orize');

module.exports = function(app){
    var njax_api =  {
        route:function(uri){
            var server = oauth2orize.createServer();
            app.get(
                uri,
                function(req, res, next){
                    if(!req.user) return res.send(404);
                    return next();
                },
                server.authorize(function(client_id, redirectURI, done) {
                    app.model.Application.findOne({ namespace: client_id}, function(err, client) {
                        if (err) { return done(err); }
                        if (!client) { return done(null, false); }
                        if (!client.redirectUri != redirectURI) { return done(null, false); }
                        return done(null, client, client.redirectURI);
                    });
                }),
                function(req, res) {
                    res.render('dialog', { transactionID: req.oauth2.transactionID,
                        user: req.user, client: req.oauth2.client });
                }
            );


            app.post(
                uri + '/decision',
                function(req, res, next){
                    if(!req.user) return res.send(404);
                    return next();
                },
                server.decision()
            );
            server.serializeClient(function(application, done) {
                return done(null, application.namespace);
            });

            server.deserializeClient(function(id, done) {
                app.model.Application.findOne({ namespace: id }, function(err, application) {
                    if (err) { return done(err); }
                    return done(null, application);
                });
            });
        },
        middleware:function(){

        }

    }
    njax_api.route('/oauth');
    return njax_api;
}