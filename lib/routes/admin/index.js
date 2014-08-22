module.exports = function(app){
    //Account managment
    var uri = app.njax.config.admin_uri || '/admin';//TODO: Add this to the config

    //TODO: Add auth
    app.all(uri, function(req, res, next){
        //IF they are not a super_admin then 404 out
        return next();
    });

    app.all(uri + '', function(req, res, next){
        res.render('admin/home');
    });

    /* ADVANCED ROUTES */
    require('./accounts')(app, uri);

}