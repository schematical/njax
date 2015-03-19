var async = require('async');
var _ = require('underscore');
module.exports = function(app, uri){
    //Account managment
    app.all(uri +'/accounts', [
        app.njax.routes.account.populate_list_query,
        app.njax.routes.account.populate_list,
        app.njax.routes.account.bootstrap_list,
        app.njax.routes.account.render_list
    ]);
    app.post(uri + '/accounts/new',  function(req, res, next) {
        var Account =  app.model.Account;
        var user = new Account({
            email : req.body.email,
            namespace: req.body.namespace,
            name: req.body.name
        });

        Account.register(user, req.body.password, function(err, account) {
            if (err) {
                console.error(err);
                return res.render(
                    'model/account_list',
                    {
                        account : account,
                        error:err,
                        namespace: req.body.namespace,
                        name: req.body.name
                    }
                );
            }
            //Figure out what to do
            //return res.send("Created " + user.email);
            return res.redirect(uri + '/accounts#account-' + user.namespace);
            /*
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });*/
        })



    });
    app.all(uri + '/accounts/:account/login_as',  function(req, res, next) {
         req.login(req.account, function(err) {
         if (err) { return next(err); }
            return res.redirect('/');
         });

    });
    app.all(uri + '/accounts/:account/forgot_pass',  function(req, res, next) {
        var account = req.account;
        var forgot_pass_code = null;
        async.series([
            function(cb){

                forgot_pass_code = app.njax.helpers.uid(24);
                account.forgot_pass_code = forgot_pass_code;
                account.save(function(err){
                    if(err) return next(err);
                    return cb();
                });
            },
            function(cb){
                app.njax.broadcast(
                    [ account ],
                    'auth.forgot.pass',
                    {
                        core_www_url:req.www_url,
                        forgot_pass_code: forgot_pass_code
                    }
                );
                return cb();
            }
        ],
        function(){
            return res.send("Successfully Triggered Auth Forgot Pass");
            //return res.redirect(uri + '/accounts/:account?message=Successfully%20Sent');
        });


    });

}