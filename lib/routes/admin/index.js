module.exports = function(app){
    var route = app.njax.routes.admin = {
        init:function(){
			console.log('app.njax.env_config.env', app.njax.env_config.env);
			if(app.njax.env_config.env != 'prod'){
				app.all('/admin/install', function(req, res, next){
					return res.render('/admin/install');
				});

			}


            //Account managment
            var uri = app.njax.env_config.admin_uri;
            app.locals.admin_uri = app.njax.env_config.admin_uri;

            //TODO: Add auth
            app.all(uri + '*', function(req, res, next){
                //IF they are not a super_admin then 404 out
                if(!req.is_admin){
                    return next(404);
                }
                return next();
            });

            app.all(uri + '', function(req, res, next){
                res.render('admin/home');
            });

            /* ADVANCED ROUTES */
            require('./accounts')(app, uri);
			require('./settings')(app, uri);
        }
    }
    return route;

}