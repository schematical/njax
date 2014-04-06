
/*
 * GET users listing.
 */
var passport = require('passport');
module.exports = function(app){
    console.log(app.njax.config.auth_url);
    app.post(
        app.njax.config.auth_url,
        passport.authenticate('local', auth_post)
    );
    app.get(
        app.njax.config.auth_url,
        function(req, res, next){
            res.render('auth');
        }
    )
}
function auth_post(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/users/' + user.username);
    });
}