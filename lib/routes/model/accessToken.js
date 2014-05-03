var path = require('path');
var fs = require('fs');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = function(app, uri){
    if(!uri) uri = '/accessTokens';
    app.locals.partials._accesstoken_edit_form = 'model/_accesstoken_edit_form';
    app.param('accesstoken', populate)

    app.get(uri, render_list);
    app.get(uri + '/new', render_edit);

    app.get(uri + '/:accesstoken', render_detail);
    app.get(uri + '/:accesstoken/edit',render_edit);

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
        uri + '/:accesstoken',
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
        
        if(or_condition.length == 0){
            return next();
        }
        var query = { $or: or_condition };
        app.model.AccessToken.findOne(query, function(err, accesstoken){
            if(err){
                return next(err);
            }

            res.bootstrap('accesstoken', accesstoken);
            return next();
        })
    }

    function render_list(req, res, next){
        app.model.AccessToken.find({}, function(err, accessToken){
            if(err) return next(err);
            res.locals.accessToken = accessToken;
            res.render('model/accesstoken_list');
        });
    }
    function render_detail(req, res, next){
        if(!req.accesstoken){
            return next();
        }
        res.render('model/accesstoken_detail');
    }
    function render_edit(req, res, next){
        async.series([
            function(cb){
                if(!req.accesstoken){
                    //return next();
                    req.accesstoken = new app.model.AccessToken();
                }
                return cb();
            },
            
            function(cb){
                if(req.application){
                    return cb();
                }
                app.model.Application.find({ }, function(err, applications){
                    if(err) return next(err);
                    var application_objs = [];
                    for(var i in applications){
                        var application_obj = applications[i].toObject();
                        application_obj._selected = (req.accessToken.application == applications[i]._id);
                        application_objs.push(application_obj);
                    }
                    res.bootstrap('applications', application_objs);
                    return cb();
                });
            },
            
            function(cb){
                if(req.account){
                    return cb();
                }
                app.model.Account.find({ }, function(err, accounts){
                    if(err) return next(err);
                    var account_objs = [];
                    for(var i in accounts){
                        var account_obj = accounts[i].toObject();
                        account_obj._selected = (req.accessToken.account == accounts[i]._id);
                        account_objs.push(account_obj);
                    }
                    res.bootstrap('accounts', account_objs);
                    return cb();
                });
            },
            
            function(cb){

                res.render('model/accesstoken_edit');
            }
        ]);
    }
    function create(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.accesstoken){
            req.accesstoken = new app.model.AccessToken({
                
                        application:(req.application || null),
                
                        account:(req.account || null),
                
                cre_date:new Date()
            });
        }
        return update(req, res, next);

    }

    function update(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.accesstoken){
            return next(new Error('AccessToken not found'));
        }

        
            
                req.accesstoken.perms = req.body.perms;
            
        
            
                req.accesstoken.token = req.body.token;
            
        
            
                if(req.application){
                    req.accesstoken.application = req.application._id;
                }else if(req.body.application){
                    req.accesstoken.application = req.body.application;
                }
            
        
            
                if(req.account){
                    req.accesstoken.account = req.account._id;
                }else if(req.body.account){
                    req.accesstoken.account = req.body.account;
                }
            
        

        req.accesstoken.save(function(err, accesstoken){
            //app._refresh_locals();
            res.render('model/accesstoken_detail', { accesstoken: req.accesstoken.toObject() });
        });

    }

}