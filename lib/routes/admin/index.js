module.exports = function(app){
    //Account managment
    var uri = app.njax.config.admin_uri;
    app.locals.njax_admin_uri = uri;
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

}