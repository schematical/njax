module.exports = function(app){
    var route = app.njax.routes.util = {
        init:function(){
            app.all(
                '/me',
                function(req, res, next){
                    console.log("WhoAMI Hit");
                    res.render('me', { user:req.user });
                }
            );
        },
        whoami:function(req, res, next){
            console.log("WhoAMI Hit");
            res.render('me', { user:req.user });
        }
    }
    return route;

}