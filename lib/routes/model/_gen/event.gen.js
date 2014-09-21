var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){
    var ObjectId = app.mongoose.Types.ObjectId;
     var route = app.njax.routes.event = {
        
            owner_query:function(){
                return { }
            },
        

        init:function(uri){

            if(!uri) uri = '/events';
            app.locals.partials._event_edit_form = 'model/_event_edit_form';
            app.locals.partials._event_list_single = 'model/_event_list_single';
            app.param('event', route.populate)


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
                uri + '/:event',
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

            app.all(uri + '/:event', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:event/edit', [
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
                app.model.Event.findOne(query, function(err, event){
                    if(err){
                        return next(err);
                    }
                    if(event){
                        res.bootstrap('event', event);
                    }
                    return next();
                });
            


        },
        render_remove:function(req, res, next){
            res.render('model/event_list', res.locals.events);
        },
        render_list:function(req, res, next){
            res.render('model/event_list', res.locals.events);
        },
        populate_list_query:function(req, res, next){
            var query = _.clone(route.read_query(req));
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            
                
                    if(req.query.event_namespace){
                        query['event_namespace'] =   { $regex: new RegExp('^' + req.query.event_namespace + '', 'i') };
                    }
                
            
                
                    if(req.query.short_namespace){
                        query['short_namespace'] =   { $regex: new RegExp('^' + req.query.short_namespace + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_url){
                        query['entity_url'] =   { $regex: new RegExp('^' + req.query.entity_url + '', 'i') };
                    }
                
            
                
                    if(req.query.data){
                        query['data'] =   { $regex: new RegExp('^' + req.query.data + '', 'i') };
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
            var events = null;
            async.series([
                function(cb){
                    
                        app.model.Event.find(query, function(err, _events){
                            if(err) return next(err);
                            events = _events;
                            return cb();
                        });
                    
                },
                function(cb){
                    res.locals.events = [];
                    for(var i in events){
                        var event_data = events[i].toObject();
                        
                        res.locals.events.push(
                            event_data
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
            if(!req.event){
                return next();
            }

            

            res.render('model/event_detail', req.event.toObject());
        },
        render_edit:function(req, res, next){
            async.series([
                function(cb){
                    if(!req.event){
                        //return next();
                        req.event = new app.model.Event();
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
                            application_obj._selected = (req.event.application == applications[i]._id);
                            application_objs.push(application_obj);
                        }
                        res.bootstrap('applications', application_objs);
                        return cb();
                    });
                },
                
                function(cb){

                    res.render('model/event_edit');
                }
            ]);
        },
        create:function(req, res, next){
            if(!req.user){
                return res.redirect('/');
            }
            if(!req.event){
                req.event = new app.model.Event({
                    
                            application:(req.application && req.application._id || null),
                    
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){

            if(!req.event){
                return next();
                //return next(new Error('Event not found'));
            }

            
                
                    req.event.event_namespace = req.body.event_namespace;
                
            
                
                    req.event.short_namespace = req.body.short_namespace;
                
            
                
                    req.event.entity_url = req.body.entity_url;
                
            
                
                    req.event.data = req.body.data;
                    req.event.markModified('data');
                
            
                
                    if(req.application){
                        req.event.application = req.application._id;
                    }else if(req.body.application){
                        req.event.application = req.body.application;
                    }
                
            
                
                    //Do nothing it is an array
                    //req.event.accounts = req.body.accounts;
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.event){
                return next();
            }
            req.event.save(function(err, event){
                //app._refresh_locals();
                res.bootstrap('event', req.event);
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