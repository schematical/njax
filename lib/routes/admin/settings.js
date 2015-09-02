module.exports = function(app){
    app.all(
        app.njax.env_config.admin_uri + '/settings',
        [
            app.njax.routes.settings.middleware('super_admin_settings'),
            function(req, res, next){

                res.render('admin/settings');
            }
        ]
    );

    app.all(
        app.njax.env_config.admin_uri + '/settings/:application',
        [
            app.njax.routes.settings.middleware('super_admin_settings'),
            app.njax.routes.settings.middleware_iframe_parent('super_admin_settings'),
            function(req, res, next){

                res.render('admin/settings');
            }
        ]
    );
}