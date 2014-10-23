var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){
    var ObjectId = app.mongoose.Types.ObjectId;
     var route = app.njax.routes.tag = {
        
            owner_query:function(){
                return { }
            },
        

        init:function(uri){

            if(!uri) uri = '/tags';
            app.locals.partials._tag_edit_form = 'model/_tag_edit_form';
            app.locals.partials._tag_list_single = 'model/_tag_list_single';
            app.param('tag', route.populate)


            app.post(
                uri,
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = 'tag';
						return next();
					},
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
                    route.redirect_detail
                ]
            );
            app.post(
                uri + '/new',
                [
                	function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = 'tag';
						return next();
                	},
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
                    route.redirect_detail
                ]
            );
            app.post(
                uri + '/:tag',
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'update';
						req.njax.entity = 'tag';
						return next();
					},
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

            app.all(uri + '/:tag', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:tag/edit', [
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);
            


        },
        auth_update:function(req, res, next){
            
                if(!req.user){
                    return next(new Error(404));//res.redirect('/');
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
                app.model.Tag.findOne(query, function(err, tag){
                    if(err){
                        return next(err);
                    }
                    if(tag){
                        res.bootstrap('tag', tag);
                    }
                    return next();
                });
            


        },
        render_remove:function(req, res, next){
            res.render('model/tag_list', res.locals.tags);
        },
        render_list:function(req, res, next){
            res.render('model/tag_list', res.locals.tags);
        },
        populate_list_query:function(req, res, next){
            var query = _.clone(route.read_query(req));
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            
                
                    if(req.query.type){
                        query['type'] =   { $regex: new RegExp('^' + req.query.type + '', 'i') };
                    }
                
            
                
                    if(req.query.sub_type){
                        query['sub_type'] =   { $regex: new RegExp('^' + req.query.sub_type + '', 'i') };
                    }
                
            
                
                    if(req.query.value){
                        query['value'] =   { $regex: new RegExp('^' + req.query.value + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_type){
                        query['entity_type'] =   { $regex: new RegExp('^' + req.query.entity_type + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_url){
                        query['entity_url'] =   { $regex: new RegExp('^' + req.query.entity_url + '', 'i') };
                    }
                
            
                
                    if(req.query._entity_name){
                        query['_entity_name'] =   { $regex: new RegExp('^' + req.query._entity_name + '', 'i') };
                    }
                
            
                
                    if(req.query._entity_namespace){
                        query['_entity_namespace'] =   { $regex: new RegExp('^' + req.query._entity_namespace + '', 'i') };
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
            var tags = null;
            async.series([
                function(cb){
                    
                        app.model.Tag.find(query, function(err, _tags){
                            if(err) return next(err);
                            tags = _tags;
							res.bootstrap('tags', tags);
                            return cb();
                        });
                    
                },
                function(cb){
                    res.locals.tags = [];
                    for(var i in tags){
                        var tag_data = tags[i].toObject();
                        
                        res.locals.tags.push(
                            tag_data
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
            if(!req.tag){
                return next();
            }

            

            res.render('model/tag_detail', req.tag.toObject());
        },
        redirect_detail:function(req, res, next){
  			if(!req.tag){
                return next();
            }
            if(req.njax.call_type == 'www'){
				return res.redirect(req.tag.uri);
            }
            return route.render_detail(req, res, next);

        },
        redirect_edit:function(req, res, next){
  			if(!req.tag){
                return next();
            }

            res.redirect(req.tag.uri + '/edit');
        },
        render_edit:function(req, res, next){
            async.series([
                function(cb){
                    if(!req.tag){
                        //return next();
                        req.tag = new app.model.Tag();
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
                            application_obj._selected = (req.tag.application == applications[i]._id);
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
                            account_obj._selected = (req.tag.account == accounts[i]._id);
                            account_objs.push(account_obj);
                        }
                        res.bootstrap('accounts', account_objs);
                        return cb();
                    });
                },
                
                function(cb){

                    res.render('model/tag_edit');
                }
            ]);
        },
        create:function(req, res, next){

            if(!req.tag){
                req.tag = new app.model.Tag({
                    
                            application:(req.application && req.application._id || null),
                    
                            account:(req.user && req.user._id || null),
                    
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){

            if(!req.tag){
                return next();
                //return next(new Error('Tag not found'));
            }

            
                
                    req.tag.type = req.body.type;
                
            
                
                    req.tag.sub_type = req.body.sub_type;
                
            
                
                    req.tag.value = req.body.value;
                
            
                
                    req.tag.entity_type = req.body.entity_type;
                
            
                
                    req.tag.entity_url = req.body.entity_url;
                
            
                
                    req.tag._entity_name = req.body._entity_name;
                
            
                
                    req.tag._entity_namespace = req.body._entity_namespace;
                
            
                
                    if(req.application){
                        req.tag.application = req.application._id;
                    }else if(req.body.application){
                        req.tag.application = req.body.application;
                    }
                
            
                
                    if(req.account){
                        req.tag.account = req.account._id;
                    }else if(req.body.account){
                        req.tag.account = req.body.account;
                    }
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.tag){
                return next();
            }
            req.tag.save(function(err, tag){
                //app._refresh_locals();
                res.bootstrap('tag', req.tag);
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
		create_tag:function(req, res, next){
			if(!req.tag){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.tag,
				function(err, tag){
					if(err) return next(err);
					res.bootstrap('tag', tag);
					return next();
				}
			);
		},
		remove_tag:function(req, res, next){
			if(!req.tag){
				return next(new Error(404));
			}
			return req.tag.remove(function(err){
				if(err) return next(err);
				return next();
			});
		},
		list_tags:function(req, res, next){
			app.njax.tags.query(req.tag, function(err, tags){
				if(err) return next(err);
				res.bootstrap('tags', tags);
				return next();
			});
		},
		render_tags:function(req, res, next){
			return res.render('model/tags_list', res.locals.tags);
		},
		render_tag:function(req, res, next){
			return res.render('model/tag_detail', res.locals.tag);
		},



		/*
		create_event:function(req, res, next){
			if(!req.tag){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.tag,
				function(err, tag){
					if(err) return next(err);
					res.bootstrap('event', event);
					return next();
				}
			);
		},
		remove_event:function(req, res, next){
			if(!req.event){
				return next(new Error(404));
			}
			return req.event.remove(function(err){
				if(err) return next(err);
				return next();
			});
		},
		*/
		list_events:function(req, res, next){
			app.njax.events.query(req.tag, function(err, events){
				if(err) return next(err);
				res.bootstrap('events', events);
				return next();
			});
		},
		render_events:function(req, res, next){
			return res.render('model/event_list', res.locals.events);
		},
		render_event:function(req, res, next){
			return res.render('model/event_detail', res.locals.event);
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