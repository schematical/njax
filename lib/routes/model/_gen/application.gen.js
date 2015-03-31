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
                    
                        app.njax.s3.route(['thumb_img']),
                    
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
                    
                        app.njax.s3.route(['thumb_img']),
                    
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
                    
                    app.njax.s3.route(['thumb_img']),
                    
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

            app.all(uri + '/:application', [
                route.auth_query_detail,
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
                    route.auth_query_tags,
					route.list_tags,
					route.render_tags
				]);
				app.all(uri +  '/:application/tags/:tag',[
                    route.auth_update,
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.render_tag
				]);




                app.post(uri +  '/:application/subscriptions',[
                    route.auth_create_subscription,
                    route.create_subscription,
                    route.render_subscription_detail
                ]);
                app.delete(uri +  '/:application/subscriptions/:subscription',[
                    function(req, res, next){
                        if(!req.subscription){
                            return next(new Error(404));
                        }
                        return next();
                    },
                    route.remove_subscription,
                    route.render_subscription_detail
                ]);
                app.all(uri +  '/:application/subscriptions',[
                    route.auth_query_subscription,
                    route.list_subscription,
                    route.render_subscription_list
                ]);
                app.all(uri +  '/:application/subscriptions/:subscription',[
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
                    route.auth_query_detail,
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

            
                var or_condition = []

                if(app.njax.helpers.regex.isHexKey(id)){
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
            res.render('model/application_detail', res.locals.application);
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



			
			



            
                


                
            
                
                    if(req.query.namespace){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.namespace);
						req._list_query['namespace'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.name){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.name);
						req._list_query['name'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.desc){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.desc);
						req._list_query['desc'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.app_url){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.app_url);
						req._list_query['app_url'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.domain){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.domain);
						req._list_query['domain'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.secret){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.secret);
						req._list_query['secret'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.level){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.level);
						req._list_query['level'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.callback_url){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.callback_url);
						req._list_query['callback_url'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.iframes){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.iframes);
						req._list_query['iframes'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.bootstrap_data){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.bootstrap_data);
						req._list_query['bootstrap_data'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.owner){
                        req._list_query['owner'] = req.query.owner;
                    }
                
            
                
                    if(req.query.widgets){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.widgets);
						req._list_query['widgets'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.auth_url){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.auth_url);
						req._list_query['auth_url'] =  { $regex: new RegExp('.*' + escpaedField + '', 'i') };
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
                    




                        if(req.query.$orderby){
                            var orderby_parts = req.query.$orderby.split(':');
                            var orderby_data = {};
                            orderby_data['_query_field'] = (typeof(orderby_parts[1]) != 'undefined' && parseInt(orderby_parts[1])) || 1;
                            var agg_query = [
                                { $match:query },
                                {
                                    $project: {

                                        
                                            thumb_img:'$thumb_img',
                                        
                                            namespace:'$namespace',
                                        
                                            name:'$name',
                                        
                                            desc:'$desc',
                                        
                                            app_url:'$app_url',
                                        
                                            domain:'$domain',
                                        
                                            secret:'$secret',
                                        
                                            level:'$level',
                                        
                                            callback_url:'$callback_url',
                                        
                                            iframes:'$iframes',
                                        
                                            bootstrap_data:'$bootstrap_data',
                                        
                                            owner:'$owner',
                                        
                                            widgets:'$widgets',
                                        
                                            auth_url:'$auth_url',
                                        

                                        _query_field: { $toLower: '$' + orderby_parts[0] }

                                    }
                                },
                                {
                                    $sort: orderby_data
                                }
                            ];

                            return app.model.Application.aggregate(
                                agg_query
                            ).exec(function(err, _applications_data){
                                if(err) return next(err);
                                res.bootstrap('applications', _applications_data);
                                return next();
                            });

                        }





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
                
                    if(!req.body.namespace && req.body.name){
                        req.application.namespace = app.njax.helpers.toNamespace(req.body.name);
                    }
                

            }
            return next();

        },
        update:function(req, res, next){

            if(!req.application){
                return next();
                //return next(new Error('Application not found'));
            }

            
                
                    if(req.njax.files && req.njax.files.thumb_img){
                        req.application.thumb_img = req.njax.files.thumb_img;
                    }
                
            
                
					if(!_.isUndefined(req.body.namespace)){
                    	req.application.namespace = req.body.namespace;
					}
                
            
                
					if(!_.isUndefined(req.body.name)){
                    	req.application.name = req.body.name;
					}
                
            
                
					if(!_.isUndefined(req.body.desc)){
                    	req.application.desc = req.body.desc;
					}
                
            
                
					if(!_.isUndefined(req.body.app_url)){
                    	req.application.app_url = req.body.app_url;
					}
                
            
                
					if(!_.isUndefined(req.body.domain)){
                    	req.application.domain = req.body.domain;
					}
                
            
                
					if(!_.isUndefined(req.body.secret)){
                    	req.application.secret = req.body.secret;
					}
                
            
                
					if(!_.isUndefined(req.body.level)){
                    	req.application.level = req.body.level;
					}
                
            
                
					if(!_.isUndefined(req.body.callback_url)){
                    	req.application.callback_url = req.body.callback_url;
					}
                
            
                
                	if(!_.isUndefined(req.body.iframes)){
                    	req.application.iframes = req.body.iframes;
                    	req.application.markModified('iframes');
					}
                
            
                
                	if(!_.isUndefined(req.body.bootstrap_data)){
                    	req.application.bootstrap_data = req.body.bootstrap_data;
                    	req.application.markModified('bootstrap_data');
					}
                
            
                
                	
						if(!req.application.owner && req.user){
							req.application.owner = req.user._id;
						}
                	
                
            
                
                	if(!_.isUndefined(req.body.widgets)){
                    	req.application.widgets = req.body.widgets;
                    	req.application.markModified('widgets');
					}
                
            
                
					if(!_.isUndefined(req.body.auth_url)){
                    	req.application.auth_url = req.body.auth_url;
					}
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.application){
                return next();
            }
            req.application.save(function(err, application){
				if(err){
					return next(err);
				}
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





        create_subscription:function(req, res, next){
            if(!req.application){
                return next(new Error(404));
            }
            //TODO: Add validation
            return app.njax.subscription.add(
                req.user,
                req.application,
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
            app.njax.subscription.query(req.application, function(err, subscriptions){
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
            if(!req.application){
                return next(new Error(404));
            }
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
