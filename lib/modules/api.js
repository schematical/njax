var oauth2orize = require('oauth2orize');
var _ = require('underscore');
module.exports = function(app){
    var njax_api =  {

        route:function(uri){

            app.get(
                uri,
                function(req, res, next){
                    if(!req.user) return res.send(404);
                    return next();
                },
                server.authorize(function(client_id, redirect_uri, done) {
                    app.model.Application.findOne({ namespace: client_id}, function(err, application) {
                        if (err) { return done(err); }
                        if (!application) { return done(null, false); }
                        //if (!_.contains(application.redirect_uris, redirect_uri)) { return done(null, false); }
                        return done(null, application, redirect_uri);
                    });
                }),
                function(req, res) {
                    res.render('njax/oauth/dialog',
                        {
                            auth_root_uri:uri,
                            transactionID: req.oauth2.transactionID,
                            //user: req.user,
                            application: req.oauth2.client
                        }
                    );
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

        },
        uid:function(len) {
            var buf = []
                , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                , charlen = chars.length;

            for (var i = 0; i < len; ++i) {
                buf.push(chars[njax_api.getRandomInt(0, charlen - 1)]);
            }

            return buf.join('');
        },

        /**
         * Return a random int, used by `utils.uid()`
         *
         * @param {Number} min
         * @param {Number} max
         * @return {Number}
         * @api private
         */

        getRandomInt:function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

    }

    var server = oauth2orize.createServer();
    server.grant(oauth2orize.grant.code(function(application, redirect_uri, account, ares, done) {
        var code = njax_api.uid(16)

        var requestCode = new app.model.RequestCode({
            application:application._id,
            code:code,
            redirect_uri:redirect_uri,
            account:account._id
        });
        requestCode.save(function(err) {
            if (err) { return done(err); }
            done(null, code);
        });
    }));

    server.exchange(oauth2orize.exchange.code(function(application, code, redirect_uri, done) {
        var token = null;
        var requestCode = null;
        var accessToken = null;
        async.series([
            function(cb){
                app.model.RequestCode.find({ code:code }, function(err, _requestCode) {
                    var requestCode = _requestCode;

                    if (err) { return done(err); }
                    if (requestCode === undefined) { return done(null, false); }
                    if (application.namespace !== requestCode.application) { return done(null, false); }
                    if (redirect_uri !== requestCode.redirect_uri) { return done(null, false); }
                    return cb();
                });
            },
            function(cb){
                token = utils.uid(256);
                var accessToken = new app.model.AccessToken({
                    token:token,
                    account:requestCode.account,
                    application: requestCode.application
                });
                accessToken.save( function(err) {
                    if (err) { return done(err); }
                    return cb();
                });
            },
            function(cb){
                requestCode.remove(function(err) {
                    if(err) { return done(err); }
                    done(null, token);


                });
            },
        ]);
    }));

    njax_api.route('/oauth');
    return njax_api;
}