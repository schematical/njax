module.exports = function(app, uri){
    //Account managment
    app.all(uri + '/accounts', function(req, res, next){
        //List all accounts for that location(TODO Make this real)
        //LAZY LOADING FOR NOW - NO CACHING
        app.model.Account.find({}).exec(function(err, accounts){
            if(err) return next(err);
            res.bootstrap('accounts', accounts);
            res.render('model/account_list');

        });
    });

}