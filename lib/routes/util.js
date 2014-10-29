module.exports = function(app){
    var route = app.njax.routes.util = {
        init:function(){
            app.all(
                app.njax.config.whoami_uri,
                route.whoami
            );
            app.all(
                '/sdk.js',
                function(req, res, next){
                    req.njax.call_type = 'www';
					var sdk_bootstrap = {
						cookie: res._bootstrap.cookie,
						core_api_url: req.core_api_url
					}
					res.locals.sdk_bootstrap = JSON.stringify(sdk_bootstrap);
                    res.render('sdk');
                }
            );
        },
        whoami:function(req, res, next){
            res.render('me', { user: req.user && req.user.toObject() });
        }
    }
    return route;

}