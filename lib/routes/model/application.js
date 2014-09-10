var path = require('path');
var fs = require('fs');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = function(app, uri){
    if(!uri) uri = '/applications';
    app.locals.partials._application_edit_form = 'model/_application_edit_form';
    app.locals.partials._application_list_single = 'model/_application_list_single'
    app.param('application', populate)

    app.get(uri, render_list);
    app.get(uri + '/new', render_edit);

    app.get(uri + '/:application', render_detail);
    app.get(uri + '/:application/edit',render_edit);

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
        uri + '/:application',
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
        app.model.Application.findOne(query, function(err, application){
            if(err){
                return next(err);
            }

            res.bootstrap('application', application);
            return next();
        })
    }

    function render_list(req, res, next){
        app.model.Application.find({}, function(err, applications){
            if(err) return next(err);
            res.locals.applications = [];
            for(var i in applications){
                res.locals.applications.push(
                    applications[i].toObject()
                );
            }
            res.render('model/application_list');
        });
    }
    function render_detail(req, res, next){
        if(!req.application){
            return next();
        }
        res.render('model/application_detail');
    }
    function render_edit(req, res, next){
        async.series([
            function(cb){
                if(!req.application){
                    //return next();
                    req.application = new app.model.Application();
                }
                return cb();
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
                        account_obj._selected = (req.application.account == accounts[i]._id);
                        account_objs.push(account_obj);
                    }
                    res.bootstrap('accounts', account_objs);
                    return cb();
                });
            },
            
            function(cb){

                res.render('model/application_edit');
            }
        ]);
    }
    function create(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.application){
            req.application = new app.model.Application({
                
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
        if(!req.application){
            return next(new Error('Application not found'));
        }

        
            
                req.application.namespace = req.body.namespace;
            
        
            
                req.application.name = req.body.name;
            
        
            
                req.application.desc = req.body.desc;
            
        
            
                req.application.url = req.body.url;
            
        
            
                req.application.secret = req.body.secret;

                req.application.callback_url = req.body.callback_url;
        
            
                req.application.level = req.body.level;
            
        
            
                if(req.account){
                    req.application.owner = req.account._id;
                }else if(req.body.owner){
                    req.application.owner = req.body.owner;
                }
            
        

        req.application.save(function(err, application){
            //app._refresh_locals();
            res.render('model/application_detail', { application: req.application.toObject() });
        });

    }

}