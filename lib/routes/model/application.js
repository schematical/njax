var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){
    var ObjectId = app.mongoose.Types.ObjectId;
     var route = app.njax.routes.application = {
        
            owner_query:function(req){
                if(!req.user){
                    return null;
                }
                return {
                    owner:req.user._id
                }
            },
        

        init:function(uri){

            if(!uri) uri = '/apps';
            app.locals.partials._application_edit_form = 'model/_application_edit_form';
            app.locals.partials._application_list_single = 'model/_application_list_single';
            app.param('application', route.populate)


            app.post(
                uri,
                [
                    route.auth_create,
                    
                    route.validate,
                    route.pre_create,
                    route.create,
                    route.update,
                    route.pre_update_save,
                    route.update_save,
                    route.post_create,
                    route.bootstrap_detail,
                    route.broadcast_create,
                    route.render_detail
                ]
            );
            app.post(
                uri + '/new',
                [
                    route.auth_create,
                    
                    route.validate,
                    route.pre_create,
                    route.create,
                    route.update,
                    route.pre_update_save,
                    route.update_save,
                    route.post_create,
                    route.bootstrap_detail,
                    route.broadcast_create,
                    route.render_detail
                ]
            );
            app.post(
                uri + '/:application',
                [
                    route.auth_update,
                    
                    route.validate,
                    route.pre_update,
                    route.update,
                    route.pre_update_save,
                    route.update_save,
                    route.post_update,
                    route.bootstrap_detail,
                    route.broadcast_update,
                    route.render_detail
                ]
            );
            

            app.all(uri, [
                route.populate_list_query,
                route.populate_list,
                route.bootstrap_list,
                route.render_list
            ]);
            app.all(uri + '/new', [
                route.bootstrap_edit,
                route.render_edit
            ]);

            app.all(uri + '/:application', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:application/edit', [
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);


        },
        auth_update:function(req, res, next){
            
                if(req.user && ((req.application && (req.application.owner == req.user._id)) || (req.is_admin))){
                    return  next();//We have a legit users
                }
                return next(404);//We do not have a legit user
            
        },
        auth_create:function(req, res, next){
             //ENtities that have not been created do not have an owner to manage
             return next();

        },
        populate:function(req, res, next, id){
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            
                var or_condition = []

                if(checkForHexRegExp.test(id)){
                    or_condition.push({ _id:new ObjectId(id) });
                }
                
                    or_condition.push({ namespace:id });
                
                if(or_condition.length == 0){
                    return next();
                }
                var query = {
                    $and:[
                        { $or: or_condition }

                    
                     ]
                };
                app.model.Application.findOne(query, function(err, application){
                    if(err){
                        return next(err);
                    }
                    if(application){
                        res.bootstrap('application', application);
                    }
                    return next();
                });
            


        },
        render_remove:function(req, res, next){
            res.render('model/application_list', res.locals.applications);
        },
        render_list:function(req, res, next){
            res.render('model/application_list', res.locals.applications);
        },
        populate_list_query:function(req, res, next){
            var query = _.clone(route.read_query(req));
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            
                
                    if(req.query.namespace){
                        query['namespace'] =   { $regex: new RegExp('^' + req.query.namespace + '', 'i') };
                    }
                
            
                
                    if(req.query.name){
                        query['name'] =   { $regex: new RegExp('^' + req.query.name + '', 'i') };
                    }
                
            
                
                    if(req.query.desc){
                        query['desc'] =   { $regex: new RegExp('^' + req.query.desc + '', 'i') };
                    }
                
            
                
                    if(req.query.url){
                        query['url'] =   { $regex: new RegExp('^' + req.query.url + '', 'i') };
                    }
                
            
                
                    if(req.query.secret){
                        query['secret'] =   { $regex: new RegExp('^' + req.query.secret + '', 'i') };
                    }
                
            
                
                    if(req.query.level){
                        query['level'] =   { $regex: new RegExp('^' + req.query.level + '', 'i') };
                    }
                
            
                
                    if(req.query.callback_url){
                        query['callback_url'] =   { $regex: new RegExp('^' + req.query.callback_url + '', 'i') };
                    }
                
            
                
                if(req.query.owner){
                    if(checkForHexRegExp.test(req.query.owner)){
                        query['owner'] = req.query.owner;
                    }
                }
                
            


            req._list_query = query;
            return next();
        },
        populate_list:function(req, res, next){
            var query = req._list_query;
            if(!query){
                return next();
            }
            var applications = null;
            async.series([
                function(cb){
                    
                        app.model.Application.find(query, function(err, _applications){
                            if(err) return next(err);
                            applications = _applications;
                            return cb();
                        });
                    
                },
                function(cb){
                    res.locals.applications = [];
                    for(var i in applications){
                        var application_data = applications[i].toObject();
                        
                            if(req.user && (applications[i].owner == req.user._id)){
                                application_data._user_is_owner = true;
                            }
                        
                        res.locals.applications.push(
                            application_data
                        );
                    }
                    return cb();
                },
                function(cb){
                    return next();
                }
            ]);
        },
        render_detail:function(req, res, next){
            if(!req.application){
                return next();
            }

            
                if(req.user && req.application && req.application.owner == req.user._id){
                    res.locals._user_is_owner = true;
                }
            

            res.render('model/application_detail', req.application.toObject());
        },
        render_edit:function(req, res, next){
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
        },
        create:function(req, res, next){
            if(!req.user){
                return res.redirect('/');
            }
            if(!req.application){
                req.application = new app.model.Application({
                    
                            owner:(req.user && req.user._id || null),
                    
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){
            if(!req.user){
                return next();//res.redirect('/');
            }
            if(!req.application){
                return next();
                //return next(new Error('Application not found'));
            }

            
                
                    req.application.namespace = req.body.namespace;
                
            
                
                    req.application.name = req.body.name;
                
            
                
                    req.application.desc = req.body.desc;
                
            
                
                    req.application.url = req.body.url;
                
            
                
                    req.application.secret = req.body.secret;
                
            
                
                    req.application.level = req.body.level;
                
            
                
                    req.application.callback_url = req.body.callback_url;
                
            
                
                    if(req.account){
                        req.application.owner = req.account._id;
                    }else if(req.body.owner){
                        req.application.owner = req.body.owner;
                    }
                
            

            return next();

        },
        update_save:function(req, res, next){
            req.application.save(function(err, application){
                //app._refresh_locals();
                res.bootstrap('application', req.application);
                return next();
            });
        },
        query:function(req, res, next){
            return next();
        },
        pre_update_save:function(req, res, next){
            return next();
        },
        bootstrap_list:function(req, res, next){
            return next();
        },
        bootstrap_detail:function(req, res, next){
            
                if(req.user && req.application && req.application.owner && (req.application.owner.equals(req.user._id))){
                    res.bootstrap('is_owner', true);
                }else{
                    res.bootstrap('is_owner', false);
                }
            
            return next();
        },
        bootstrap_edit:function(req, res, next){
            return next();
        },
        validate:function(req, res, next){
            return next();
        },
        pre_update:function(req, res, next){
            return next();
        },
        pre_create:function(req, res, next){
            return next();
        },
        pre_create_properties:function(req, res, next){
            return next();
        },
        pre_remove:function(req, res, next){
            return next();
        },
        post_update:function(req, res, next){
            return next();
        },
        post_create:function(req, res, next){
            return next();
        },
        post_remove:function(req, res, next){
                return next();
        },
        broadcast_create:function(req, res, next){
            
                app.njax.broadcast(
                    [ req.user ],
                    'application.update',
                    {
                        user:req.user.toObject(),
                        application: req.application.toObject()
                    }
                );
                return next();
            
        },
        broadcast_update:function(req, res, next){
            

                    app.njax.broadcast(
                        [ req.user ],
                        'application.update',
                        {
                            user:req.user.toObject(),
                            application: req.application.toObject()
                        }
                    );

                return next();
            
        },
        broadcast_remove:function(req, res, next){
            

                app.njax.broadcast(
                    [ req.user ],
                    'application.remove',
                    {
                        user:req.user.toObject(),
                        application: req.application.toObject()
                    }
                );
                return next();
            
        },
        
    }

    route.read_query = route.owner_query;
    route.write_query = route.owner_query;

    return route;

}