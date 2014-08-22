var path = require('path');
var fs = require('fs');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = function(app, uri){
    if(!uri) uri = '/accounts';
    app.locals.partials._account_edit_form = 'model/_account_edit_form';
    app.locals.partials._account_list_single = 'model/_account_list_single';
    app.param('account', populate)

    app.get(uri, render_list);
    app.get(uri + '/new', render_edit);

    app.get(uri + '/:account', render_detail);
    app.get(uri + '/:account/edit',render_edit);

    app.post(
        uri,
        [
            
            create
        ]
    );
    app.post(
        uri + '/new',
        [
            
            create
        ]
    );
    app.post(
        uri + '/:account',
        [
            
            update
        ]
    );


    function populate(req, res, next, id){
        var or_condition = []


        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
        if(checkForHexRegExp.test(id)){
            or_condition.push({ _id:new ObjectId(id) });
        }
        
            or_condition.push({ namespace:id });
        
        if(or_condition.length == 0){
            return next();
        }
        var query = { $or: or_condition };
        app.model.Account.findOne(query, function(err, account){
            if(err){
                return next(err);
            }

            res.bootstrap('account', account);
            return next();
        })
    }

    function render_list(req, res, next){
        app.model.Account.find({}, function(err, accounts){
            if(err) return next(err);
            res.locals.accounts = [];
            for(var i in accounts){
                res.locals.accounts.push(
                    accounts[i].toObject()
                );
            }
            res.render('model/account_list');
        });
    }
    function render_detail(req, res, next){
        if(!req.account){
            return next();
        }
        res.render('model/account_detail');
    }
    function render_edit(req, res, next){
        async.series([
            function(cb){
                if(!req.account){
                    //return next();
                    req.account = new app.model.Account();
                }
                return cb();
            },
            
            function(cb){

                res.render('model/account_edit');
            }
        ]);
    }
    function create(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.account){
            req.account = new app.model.Account({
                
                cre_date:new Date()
            });
        }
        return update(req, res, next);

    }

    function update(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.account){
            return next(new Error('Account not found'));
        }

        
            
                req.account.email = req.body.email;
            
        
            
                req.account.name = req.body.name;
            
        
            
                req.account.namespace = req.body.namespace;
            
        

        req.account.save(function(err, account){
            //app._refresh_locals();
            res.render('model/account_detail', { account: req.account.toObject() });
        });

    }

}