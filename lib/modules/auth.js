var passport = require('passport');
module.exports = function(app){
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function(req, res, next){
        if(req.user){
            res.locals.user = req.user.toObject();
        }
        return next();
    })

    require('../routes/auth')(app);
}