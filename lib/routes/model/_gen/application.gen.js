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
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = 'application';
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
						req.njax.entity = 'application';
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
                uri + '/:application',
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'update';
						req.njax.entity = 'application';
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
				route.populate_tag_query,
                route.populate_list_query,
                route.populate_list,
                route.bootstrap_list,
                route.render_list
            ]);
            app.all(uri + '/new', [
            	route.auth_create,
                route.bootstrap_edit,
                route.render_edit
            ]);

            app.all(uri + '/:application', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:application/edit', [
            	function(req, res, next){
					if(!req.application){
						return next(new Error(404));
					}
					return next();
            	},
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);
            
            	app.post(uri +  '/:application/tags',[
            		route.validate_tag,
					route.create_tag,
					route.broadcast_update,
					route.render_tag
				]);
				app.delete(uri +  '/:application/tags/:tag',[
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.remove_tag,
					route.broadcast_update,
					route.render_tag
				]);
				app.all(uri +  '/:application/tags',[
					route.list_tags,
					route.render_tags
				]);
				app.all(uri +  '/:application/tags/:tag',[
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.render_tag
				]);




				/*
				//For now we will use the trigger event
				app.post(uri +  '/:application/events',[
					route.create_event,
					route.broadcast_event,
					route.render_tag
				]);
				//We dont need to remove events at this point
				app.delete(uri +  '/:application/events/:event',[
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.remove_event,
					route.render_event
				]);
				*/

				app.all(uri +  '/:application/events',[
					route.list_events,
					route.render_events
				]);
				app.all(uri +  '/:application/events/:event',[
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.render_events
				]);


            


        },
        auth_update:function(req, res, next){
            
            	
					if(req.user && (req.application && (req.application.owner && req.application.owner.equals(req.user._id)) || (req.is_admin))){
						return  next();//We have a legit users
					}
                
                return next(new Error(403));//We do not have a legit user
            
        },
        auth_create:function(req, res, next){
             //ENtities that have not been created do not have an owner to manage
             if(!req.user){
                 return next(new Error(404));//res.redirect('/');
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
		populate_tag_query:function(req, res, next){

			if(!req.query.tags){
				return next();
			}
			if(!req._list_query){
				req._list_query = _.clone(route.read_query(req));
			}
			var tag_query = [];
			var tags = req.query.tags.split(',');
			for(var i in tags){
				tag_query.push({ value: tags[i] });
			}

			return app.njax.tags.query(
				{
					tag_query:tag_query,
					entity_type:"Application"
				},
				function(err, entites){
					if(err) return next(err);
					var entity_id_query = [];
					if(entites.length == 0){
						req._list_query = false;
						return next();
					}
					for(var i in entites){
						entity_id_query.push({ _id: entites[i].entity_id });
					}

					req._list_query.$or = entity_id_query;


					return next();
				}
			);

		},
        populate_list_query:function(req, res, next){
			if(!req._list_query){
				if(req._list_query === false){
					//Then they tried to tag search and it returned no results
					return next();
				}else{
					req._list_query = _.clone(route.read_query(req));
					if(!req._list_query){
						req._list_query = {}; //return next();//TODO: Fix this so its secure
					}

				}
			}



			
			



            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            
                
                    if(req.query.namespace){
						req._list_query['namespace'] =   { $regex: new RegExp('^' + req.query.namespace + '', 'i') };
                    }
                
            
                
                    if(req.query.name){
						req._list_query['name'] =   { $regex: new RegExp('^' + req.query.name + '', 'i') };
                    }
                
            
                
                    if(req.query.desc){
						req._list_query['desc'] =   { $regex: new RegExp('^' + req.query.desc + '', 'i') };
                    }
                
            
                
                    if(req.query.app_url){
						req._list_query['app_url'] =   { $regex: new RegExp('^' + req.query.app_url + '', 'i') };
                    }
                
            
                
                    if(req.query.domain){
						req._list_query['domain'] =   { $regex: new RegExp('^' + req.query.domain + '', 'i') };
                    }
                
            
                
                    if(req.query.secret){
						req._list_query['secret'] =   { $regex: new RegExp('^' + req.query.secret + '', 'i') };
                    }
                
            
                
                    if(req.query.level){
						req._list_query['level'] =   { $regex: new RegExp('^' + req.query.level + '', 'i') };
                    }
                
            
                
                    if(req.query.callback_url){
						req._list_query['callback_url'] =   { $regex: new RegExp('^' + req.query.callback_url + '', 'i') };
                    }
                
            
                
                    if(req.query.iframes){
						req._list_query['iframes'] =   { $regex: new RegExp('^' + req.query.iframes + '', 'i') };
                    }
                
            
                
                    if(req.query.bootstrap_data){
						req._list_query['bootstrap_data'] =   { $regex: new RegExp('^' + req.query.bootstrap_data + '', 'i') };
                    }
                
            
                
                    if(req.query.owner){
						req._list_query['owner'] =   { $regex: new RegExp('^' + req.query.owner + '', 'i') };
                    }
                
            



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
							res.bootstrap('applications', applications);
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
        redirect_detail:function(req, res, next){
  			if(!req.application){
                return next();
            }
            if(req.njax.call_type == 'www'){
				return res.redirect(req.application.uri);
            }
            return route.render_detail(req, res, next);

        },
        redirect_edit:function(req, res, next){
  			if(!req.application){
                return next();
            }

            res.redirect(req.application.uri + '/edit');
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

                    res.render('model/application_edit');
                }
            ]);
        },
        create:function(req, res, next){

            if(!req.application){
                req.application = new app.model.Application({
                    
                            owner:(req.user && req.user._id || null),
                    
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){

            if(!req.application){
                return next();
                //return next(new Error('Application not found'));
            }

            
                
					if(req.body.namespace){
                    	req.application.namespace = req.body.namespace;
					}
                
            
                
					if(req.body.name){
                    	req.application.name = req.body.name;
					}
                
            
                
					if(req.body.desc){
                    	req.application.desc = req.body.desc;
					}
                
            
                
					if(req.body.app_url){
                    	req.application.app_url = req.body.app_url;
					}
                
            
                
					if(req.body.domain){
                    	req.application.domain = req.body.domain;
					}
                
            
                
					if(req.body.secret){
                    	req.application.secret = req.body.secret;
					}
                
            
                
					if(req.body.level){
                    	req.application.level = req.body.level;
					}
                
            
                
					if(req.body.callback_url){
                    	req.application.callback_url = req.body.callback_url;
					}
                
            
                
                	if(req.body.iframes){
                    	req.application.iframes = req.body.iframes;
                    	req.application.markModified('iframes');
					}
                
            
                
                	if(req.body.bootstrap_data){
                    	req.application.bootstrap_data = req.body.bootstrap_data;
                    	req.application.markModified('bootstrap_data');
					}
                
            
                
                	
						if(!req.application.owner && req.user){
							req.application.owner = req.user._id;
						}
                	
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.application){
                return next();
            }
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
		validate_tag:function(req, res, next){
			if(!req.body.type){
				return next(new Error("Ivalid type"));
			}
			return next();
		},
		create_tag:function(req, res, next){
			if(!req.application){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.application,
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
			app.njax.tags.query(req.application, function(err, tags){
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
			if(!req.application){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.application,
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
			app.njax.events.query(req.application, function(err, events){
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
            
                app.njax.broadcast(
                    [ req.user ],
                    'application.create',
                    {
                        user:req.user.toObject(),
                        application: req.application.toObject(),
						_url:req.application.url,
						_entity_type:req.application._njax_type
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
                            application: req.application.toObject(),
							_url:req.application.url,
							_entity_type:req.application._njax_type
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
                        application: req.application.toObject(),
						_url:req.application.url,
						_entity_type:req.application._njax_type
                    }
                );
                return next();
            
        },
        
    }

    route.read_query = route.owner_query;
    route.write_query = route.owner_query;

    return route;

}
