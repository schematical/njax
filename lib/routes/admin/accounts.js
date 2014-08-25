module.exports = function(app, uri){
    //Account managment
    app.all(uri + '/accounts', function(req, res, next){
        //List all accounts for that location(TODO Make this real)
        //LAZY LOADING FOR NOW - NO CACHING
        app.model.Account.find({}).exec(function(err, accounts){
            if(err) return next(err);
            res.bootstrap('accounts', accounts);
            res.render('admin/account_list');

        });
    });
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

}