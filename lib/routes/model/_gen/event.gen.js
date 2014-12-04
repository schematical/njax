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
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = 'event';
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
						req.njax.entity = 'event';
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
                uri + '/:event',
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'update';
						req.njax.entity = 'event';
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

            app.all(uri + '/:event', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:event/edit', [
            	function(req, res, next){
					if(!req.event){
						return next(new Error(404));
					}
					return next();
            	},
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);
            
            	app.post(uri +  '/:event/tags',[
            		route.validate_tag,
					route.create_tag,
					route.broadcast_update,
					route.render_tag
				]);
				app.delete(uri +  '/:event/tags/:tag',[
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
				app.all(uri +  '/:event/tags',[
					route.list_tags,
					route.render_tags
				]);
				app.all(uri +  '/:event/tags/:tag',[
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
				app.post(uri +  '/:event/events',[
					route.create_event,
					route.broadcast_event,
					route.render_tag
				]);
				//We dont need to remove events at this point
				app.delete(uri +  '/:event/events/:event',[
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

				app.all(uri +  '/:event/events',[
					route.list_events,
					route.render_events
				]);
				app.all(uri +  '/:event/events/:event',[
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
            
                if(!req.user){
                    return next(new Error(404));//res.redirect('/');
                }
                return next();
             
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
					entity_type:"Event"
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
            
                
                    if(req.query.event_namespace){
						req._list_query['event_namespace'] =   { $regex: new RegExp('^' + req.query.event_namespace + '', 'i') };
                    }
                
            
                
                    if(req.query.short_namespace){
						req._list_query['short_namespace'] =   { $regex: new RegExp('^' + req.query.short_namespace + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_url){
						req._list_query['entity_url'] =   { $regex: new RegExp('^' + req.query.entity_url + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_type){
						req._list_query['entity_type'] =   { $regex: new RegExp('^' + req.query.entity_type + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_id){
						req._list_query['entity_id'] =   { $regex: new RegExp('^' + req.query.entity_id + '', 'i') };
                    }
                
            
                
                    if(req.query.data){
						req._list_query['data'] =   { $regex: new RegExp('^' + req.query.data + '', 'i') };
                    }
                
            
                
                    if(req.query.application){
						req._list_query['application'] =   { $regex: new RegExp('^' + req.query.application + '', 'i') };
                    }
                
            
                
                
            
                
                
            



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
							res.bootstrap('events', events);
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
        redirect_detail:function(req, res, next){
  			if(!req.event){
                return next();
            }
            if(req.njax.call_type == 'www'){
				return res.redirect(req.event.uri);
            }
            return route.render_detail(req, res, next);

        },
        redirect_edit:function(req, res, next){
  			if(!req.event){
                return next();
            }

            res.redirect(req.event.uri + '/edit');
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
                
            
                
                    req.event.entity_type = req.body.entity_type;
                
            
                
                    req.event.entity_id = req.body.entity_id;
                
            
                
                	if(req.body.data){
                    	req.event.data = req.body.data;
                    	req.event.markModified('data');
					}
                
            
                
                	
						if(req.application){
							req.event.application = req.application._id;
						}else if(req.body.application){
							req.event.application = req.body.application;
						}
					
                
            
                
                    //Do nothing it is an array
                    //req.event.accounts = req.body.accounts;
                
            
                
                    req.event.mutedDate = req.body.mutedDate;
                
            

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
		validate_tag:function(req, res, next){
			if(!req.body.type){
				return next(new Error("Ivalid type"));
			}
			return next();
		},
		create_tag:function(req, res, next){
			if(!req.event){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.event,
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
			app.njax.tags.query(req.event, function(err, tags){
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
			if(!req.event){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.event,
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
			app.njax.events.query(req.event, function(err, events){
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
