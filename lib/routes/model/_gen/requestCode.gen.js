var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){
    var ObjectId = app.mongoose.Types.ObjectId;
     var route = app.njax.routes.requestcode = {
        
            owner_query:function(){
                return { }
            },
        

        init:function(uri){

            if(!uri) uri = '/request_codes';
            app.locals.partials._requestCode_edit_form = 'model/_requestCode_edit_form';
            app.locals.partials._requestCode_list_single = 'model/_requestCode_list_single';
            app.param('requestcode', route.populate)


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
                uri + '/:requestcode',
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

            app.all(uri + '/:requestcode', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:requestcode/edit', [
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
                
                if(or_condition.length == 0){
                    return next();
                }
                var query = {
                    $and:[
                        { $or: or_condition }

                    
                     ]
                };
                app.model.RequestCode.findOne(query, function(err, requestcode){
                    if(err){
                        return next(err);
                    }
                    if(requestcode){
                        res.bootstrap('requestCode', requestcode);
                    }
                    return next();
                });
            


        },
        render_remove:function(req, res, next){
            res.render('model/requestCode_list', res.locals.requestCodes);
        },
        render_list:function(req, res, next){
            res.render('model/requestCode_list', res.locals.requestCodes);
        },
        populate_list_query:function(req, res, next){
            var query = _.clone(route.read_query(req));
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            
                
                    if(req.query.code){
                        query['code'] =   { $regex: new RegExp('^' + req.query.code + '', 'i') };
                    }
                
            
                
                if(req.query.application){
                    if(checkForHexRegExp.test(req.query.application)){
                        query['application'] = req.query.application;
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
            var requestCodes = null;
            async.series([
                function(cb){
                    
                        app.model.RequestCode.find(query, function(err, _requestCodes){
                            if(err) return next(err);
                            requestCodes = _requestCodes;
                            return cb();
                        });
                    
                },
                function(cb){
                    res.locals.requestCodes = [];
                    for(var i in requestCodes){
                        var requestCode_data = requestCodes[i].toObject();
                        
                        res.locals.requestCodes.push(
                            requestCode_data
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
            if(!req.requestCode){
                return next();
            }

            

            res.render('model/requestCode_detail', req.requestCode.toObject());
        },
        render_edit:function(req, res, next){
            async.series([
                function(cb){
                    if(!req.requestcode){
                        //return next();
                        req.requestcode = new app.model.RequestCode();
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
                            application_obj._selected = (req.requestCode.application == applications[i]._id);
                            application_objs.push(application_obj);
                        }
                        res.bootstrap('applications', application_objs);
                        return cb();
                    });
                },
                
                function(cb){

                    res.render('model/requestCode_edit');
                }
            ]);
        },
        create:function(req, res, next){

            if(!req.requestCode){
                req.requestCode = new app.model.RequestCode({
                    
                            application:(req.user && req.user._id || null),
                    
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){

            if(!req.requestCode){
                return next();
                //return next(new Error('RequestCode not found'));
            }

            
                
                    req.requestCode.code = req.body.code;
                
            
                
                    if(req.application){
                        req.requestCode.application = req.application._id;
                    }else if(req.body.application){
                        req.requestCode.application = req.body.application;
                    }
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.requestCode){
                return next();
            }
            req.requestCode.save(function(err, requestCode){
                //app._refresh_locals();
                res.bootstrap('requestCode', req.requestCode);
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