module.exports = function(app){
    var route = app.njax.routes.util = {
        init:function(){
            app.all(
                app.njax.config.whoami_uri,
                route.whoami
            );
        },
        whoami:function(req, res, next){
            console.log("WhoAMI Hit");
            res.render('me', { user: req.user && req.user.toObject() });
        }
    }
    return route;

}