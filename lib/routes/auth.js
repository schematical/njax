
/*
 * GET users listing.
 */
var passport = require('passport');
module.exports = function(app){
    app.get(app.njax.config.register_url, function(req, res) {
        res.render('register', { });
    });

    app.post(app.njax.config.register_url, function(req, res) {
        Account.register(new app.model.Account({ email : req.body.email }), req.body.password, function(err, account) {
            if (err) {
                return res.render('register', { account : account });
            }

            res.redirect('/');
        });
    });


    app.post(
        app.njax.config.auth_url,
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        })
    );
    app.get(
        app.njax.config.auth_url,
        function(req, res, next){
            res.render('auth');
        }
    )

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}
function auth_post(req, res, next){
    return
}