var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var xssFilters = require('xss-filters');
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
                route.auth_query_list,
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
                route.auth_query_detail,
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
                    route.auth_query_tags,
					route.list_tags,
					route.render_tags
				]);
				app.all(uri +  '/:event/tags/:tag',[
                    route.auth_update,
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.render_tag
				]);




                app.post(uri +  '/:event/subscriptions',[
                    route.auth_create_subscription,
                    route.create_subscription,
                    route.render_subscription_detail
                ]);
                app.delete(uri +  '/:event/subscriptions/:subscription',[
                    function(req, res, next){
                        if(!req.subscription){
                            return next(new Error(404));
                        }
                        return next();
                    },
                    route.remove_subscription,
                    route.render_subscription_detail
                ]);
                app.all(uri +  '/:event/subscriptions',[
                    route.auth_query_subscription,
                    route.list_subscription,
                    route.render_subscription_list
                ]);
                app.all(uri +  '/:event/subscriptions/:subscription',[
                    route.auth_update,
                    function(req, res, next){
                        if(!req.tag){
                            return next(new Error(404));
                        }
                        return next();
                    },
                    route.render_subscription_detail
                ])



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
                    route.auth_query_detail,
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
        auth_query_detail:function(req, res, next){
            return next();
        },
        auth_query_list:function(req, res, next){
            return next();
        },
        auth_query_tags:function(req, res, next){
            return next();
        },
        auth_query_subscription:function(req, res, next){
            return next();
        },
        auth_create_subscription:function(req, res, next){
            return next();
        },
        auth_update:function(req, res, next){
            
                if(!req.user){
                    return next(new Error(403));//res.redirect('/');
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

            
                var or_condition = []

                if(app.njax.helpers.regex.isHexKey(id)){
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
            res.render('model/event_detail', res.locals.event);
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
            var tag_check = {};

			for(var i in tags){
                if(!tag_check[tags[i]]){
                    tag_query.push({ value: tags[i] });
                    tag_check[tags[i]] = tags[i];
                }
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



			
			



            
                
                    if(req.query.event_namespace){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.event_namespace);
						req._list_query['event_namespace'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.short_namespace){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.short_namespace);
						req._list_query['short_namespace'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_url){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.entity_url);
						req._list_query['entity_url'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_type){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.entity_type);
						req._list_query['entity_type'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_id){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.entity_id);
						req._list_query['entity_id'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.data){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.data);
						req._list_query['data'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.application){
                        req._list_query['application'] = req.query.application;
                    }
                
            
                
                
            
                
                
            
                
                    if(req.query.visibility){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.visibility);
						req._list_query['visibility'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
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
                    




                        if(req.query.$orderby){
                            var orderby_parts = req.query.$orderby.split(':');
                            var orderby_data = {};
                            orderby_data['_query_field'] = (typeof(orderby_parts[1]) != 'undefined' && parseInt(orderby_parts[1])) || 1;
                            var agg_query = [
                                { $match:query },
                                {
                                    $project: {

                                        
                                            event_namespace:'$event_namespace',
                                        
                                            short_namespace:'$short_namespace',
                                        
                                            entity_url:'$entity_url',
                                        
                                            entity_type:'$entity_type',
                                        
                                            entity_id:'$entity_id',
                                        
                                            data:'$data',
                                        
                                            application:'$application',
                                        
                                            accounts:'$accounts',
                                        
                                            mutedDate:'$mutedDate',
                                        
                                            visibility:'$visibility',
                                        

                                        _query_field: { $toLower: '$' + orderby_parts[0] }

                                    }
                                },
                                {
                                    $sort: orderby_data
                                }
                            ];

                            return app.model.Event.aggregate(
                                agg_query
                            ).exec(function(err, _events_data){
                                if(err) return next(err);
                                res.bootstrap('events', _events_data);
                                return next();
                            });

                        }





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

            
                
					if(!_.isUndefined(req.body.event_namespace)){
                        var event_namespace = xssFilters.inHTMLData(req.body.event_namespace);

                    	req.event.event_namespace = event_namespace;
					}
                
            
                
					if(!_.isUndefined(req.body.short_namespace)){
                        var short_namespace = xssFilters.inHTMLData(req.body.short_namespace);

                    	req.event.short_namespace = short_namespace;
					}
                
            
                
					if(!_.isUndefined(req.body.entity_url)){
                        var entity_url = xssFilters.inHTMLData(req.body.entity_url);

                    	req.event.entity_url = entity_url;
					}
                
            
                
					if(!_.isUndefined(req.body.entity_type)){
                        var entity_type = xssFilters.inHTMLData(req.body.entity_type);

                    	req.event.entity_type = entity_type;
					}
                
            
                
					if(!_.isUndefined(req.body.entity_id)){
                        var entity_id = xssFilters.inHTMLData(req.body.entity_id);

                    	req.event.entity_id = entity_id;
					}
                
            
                
                	if(!_.isUndefined(req.body.data)){
                    	req.event.data = req.body.data;
                    	req.event.markModified('data');
					}
                
            
                
                	
						if(req.application){
							req.event.application = req.application._id;
						}else if(!_.isUndefined(req.body.application)){
							req.event.application = req.body.application;
						}
					
                
            
                
                    //Do nothing it is an array
                    //req.event.accounts = req.body.accounts;
                
            
                
					if(!_.isUndefined(req.body.mutedDate)){
                        var mutedDate = xssFilters.inHTMLData(req.body.mutedDate);

                    	req.event.mutedDate = mutedDate;
					}
                
            
                
					if(!_.isUndefined(req.body.visibility)){
                        var visibility = xssFilters.inHTMLData(req.body.visibility);

                    	req.event.visibility = visibility;
					}
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.event){
                return next();
            }
            req.event.save(function(err, event){
				if(err){
					return next(err);
				}
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





        create_subscription:function(req, res, next){
            if(!req.event){
                return next(new Error(404));
            }
            //TODO: Add validation
            return app.njax.subscription.add(
                req.user,
                req.event,
                req.body,
                function(err, subscription){
                    if(err) return next(err);
                    res.bootstrap('subscription', subscription);
                    return next();
                }
            );
        },
        remove_subscription:function(req, res, next){
            if(!req.tag){
                return next(new Error(404));
            }
            return req.subscription.remove(function(err){
                if(err) return next(err);
                return next();
            });
        },
        list_subscription:function(req, res, next){
            app.njax.subscription.query(req.event, function(err, subscriptions){
                if(err) return next(err);
                res.bootstrap('subscriptions', subscriptions);
                return next();
            });
        },
        render_subscription_list:function(req, res, next){
            return res.render('model/subscriptions_list', res.locals.subscriptions);
        },
        render_subscription_detail:function(req, res, next){
            return res.render('model/subscription_detail', res.locals.subscription);
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
            if(!req.event){
                return next(new Error(404));
            }
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
