var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){
    var ObjectId = app.mongoose.Types.ObjectId;
     var route = app.njax.routes.account = {
        
            owner_query:function(){
                return { }
            },
        

        init:function(uri){

            if(!uri) uri = '';
            app.locals.partials._account_edit_form = 'model/_account_edit_form';
            app.locals.partials._account_list_single = 'model/_account_list_single';
            app.param('account', route.populate)


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
                uri + '/:account',
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

            app.all(uri + '/:account', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:account/edit', [
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
             if(!req.user){
                 return res.redirect('/');
             }
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
                app.model.Account.findOne(query, function(err, account){
                    if(err){
                        return next(err);
                    }
                    if(account){
                        res.bootstrap('account', account);
                    }
                    return next();
                });
            


        },
        render_remove:function(req, res, next){
            res.render('model/account_list', res.locals.accounts);
        },
        render_list:function(req, res, next){
            res.render('model/account_list', res.locals.accounts);
        },
        populate_list_query:function(req, res, next){
            var query = _.clone(route.read_query(req));
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            
                
                    if(req.query.email){
                        query['email'] =   { $regex: new RegExp('^' + req.query.email + '', 'i') };
                    }
                
            
                
                    if(req.query.name){
                        query['name'] =   { $regex: new RegExp('^' + req.query.name + '', 'i') };
                    }
                
            
                
                    if(req.query.namespace){
                        query['namespace'] =   { $regex: new RegExp('^' + req.query.namespace + '', 'i') };
                    }
                
            
                
                    if(req.query.active){
                        query['active'] =   { $regex: new RegExp('^' + req.query.active + '', 'i') };
                    }
                
            
                
                    if(req.query.forgot_pass_code){
                        query['forgot_pass_code'] =   { $regex: new RegExp('^' + req.query.forgot_pass_code + '', 'i') };
                    }
                
            


            req._list_query = query;
            return next();
        },
        populate_list:function(req, res, next){
            var query = req._list_query;
            if(!query){
                return next();
            }
            var accounts = null;
            async.series([
                function(cb){
                    
                        app.model.Account.find(query, function(err, _accounts){
                            if(err) return next(err);
                            accounts = _accounts;
                            return cb();
                        });
                    
                },
                function(cb){
                    res.locals.accounts = [];
                    for(var i in accounts){
                        var account_data = accounts[i].toObject();
                        
                        res.locals.accounts.push(
                            account_data
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
            if(!req.account){
                return next();
            }

            

            res.render('model/account_detail', req.account.toObject());
        },
        render_edit:function(req, res, next){
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
        },
        create:function(req, res, next){

            if(!req.account){
                req.account = new app.model.Account({
                    
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){

            if(!req.account){
                return next();
                //return next(new Error('Account not found'));
            }

            
                
                    req.account.email = req.body.email;
                
            
                
                    req.account.name = req.body.name;
                
            
                
                    req.account.namespace = req.body.namespace;
                
            
                
                    req.account.active = req.body.active;
                
            
                
                    req.account.forgot_pass_code = req.body.forgot_pass_code;
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.account){
                return next();
            }
            req.account.save(function(err, account){
                //app._refresh_locals();
                res.bootstrap('account', req.account);
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