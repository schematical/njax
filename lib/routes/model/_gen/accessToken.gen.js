var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){
    var ObjectId = app.mongoose.Types.ObjectId;
     var route = app.njax.routes.accesstoken = {
        
            owner_query:function(){
                return { }
            },
        

        init:function(uri){

            if(!uri) uri = '/access_tokens';
            app.locals.partials._accessToken_edit_form = 'model/_accessToken_edit_form';
            app.locals.partials._accessToken_list_single = 'model/_accessToken_list_single';
            app.param('accesstoken', route.populate)


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
                uri + '/:accesstoken',
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

            app.all(uri + '/:accesstoken', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:accesstoken/edit', [
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);


        },
        auth_update:function(req, res, next){
            
                if(!req.user){
                    return next(404);//res.redirect('/');
                }
                return next();
             
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
                
                if(or_condition.length == 0){
                    return next();
                }
                var query = {
                    $and:[
                        { $or: or_condition }

                    
                     ]
                };
                app.model.AccessToken.findOne(query, function(err, accesstoken){
                    if(err){
                        return next(err);
                    }
                    if(accesstoken){
                        res.bootstrap('accessToken', accesstoken);
                    }
                    return next();
                });
            


        },
        render_remove:function(req, res, next){
            res.render('model/accessToken_list', res.locals.accessTokens);
        },
        render_list:function(req, res, next){
            res.render('model/accessToken_list', res.locals.accessTokens);
        },
        populate_list_query:function(req, res, next){
            var query = _.clone(route.read_query(req));
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            
                
                
            
                
                    if(req.query.token){
                        query['token'] =   { $regex: new RegExp('^' + req.query.token + '', 'i') };
                    }
                
            
                
                if(req.query.application){
                    if(checkForHexRegExp.test(req.query.application)){
                        query['application'] = req.query.application;
                    }
                }
                
            
                
                if(req.query.account){
                    if(checkForHexRegExp.test(req.query.account)){
                        query['account'] = req.query.account;
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
            var accessTokens = null;
            async.series([
                function(cb){
                    
                        app.model.AccessToken.find(query, function(err, _accessTokens){
                            if(err) return next(err);
                            accessTokens = _accessTokens;
                            return cb();
                        });
                    
                },
                function(cb){
                    res.locals.accessTokens = [];
                    for(var i in accessTokens){
                        var accessToken_data = accessTokens[i].toObject();
                        
                        res.locals.accessTokens.push(
                            accessToken_data
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
            if(!req.accessToken){
                return next();
            }

            

            res.render('model/accessToken_detail', req.accessToken.toObject());
        },
        render_edit:function(req, res, next){
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

                    res.render('model/accessToken_edit');
                }
            ]);
        },
        create:function(req, res, next){
            if(!req.user){
                return res.redirect('/');
            }
            if(!req.accessToken){
                req.accessToken = new app.model.AccessToken({
                    
                            application:(req.application && req.application._id || null),
                    
                            account:(req.user && req.user._id || null),
                    
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){

            if(!req.accessToken){
                return next();
                //return next(new Error('AccessToken not found'));
            }

            
                
                    //Do nothing it is an array
                    //req.accesstoken.perms = req.body.perms;
                
            
                
                    req.accessToken.token = req.body.token;
                
            
                
                    if(req.application){
                        req.accessToken.application = req.application._id;
                    }else if(req.body.application){
                        req.accessToken.application = req.body.application;
                    }
                
            
                
                    if(req.account){
                        req.accessToken.account = req.account._id;
                    }else if(req.body.account){
                        req.accessToken.account = req.body.account;
                    }
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.accessToken){
                return next();
            }
            req.accessToken.save(function(err, accessToken){
                //app._refresh_locals();
                res.bootstrap('accessToken', req.accessToken);
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
            
                return next();
            
        },
        broadcast_update:function(req, res, next){
            
                return next();
            
        },
        broadcast_remove:function(req, res, next){
            
                return next();
            
        },
        
    }

    route.read_query = route.owner_query;
    route.write_query = route.owner_query;

    return route;

}