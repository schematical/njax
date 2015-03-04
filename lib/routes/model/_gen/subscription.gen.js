var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){
    var ObjectId = app.mongoose.Types.ObjectId;
     var route = app.njax.routes.subscription = {
        
			owner_query:function(req){
				if(!req.user){
					return null;
				}
				return {
					account:req.user._id.toString()
				}
			},
		

        init:function(uri){

            if(!uri) uri = '/:account/subscriptions';
            app.locals.partials._subscription_edit_form = 'model/_subscription_edit_form';
            app.locals.partials._subscription_list_single = 'model/_subscription_list_single';
            app.param('subscription', route.populate)


            app.post(
                uri,
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = 'subscription';
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
						req.njax.entity = 'subscription';
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
                uri + '/:subscription',
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'update';
						req.njax.entity = 'subscription';
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

            app.all(uri + '/:subscription', [
                route.auth_query_detail,
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:subscription/edit', [
            	function(req, res, next){
					if(!req.subscription){
						return next(new Error(404));
					}
					return next();
            	},
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
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


				
					
						if(req.user){
							query['account'] = req.user._id;
						}
					
				
                app.model.Subscription.findOne(query, function(err, subscription){
                    if(err){
                        return next(err);
                    }
                    if(subscription){
                        res.bootstrap('subscription', subscription);
                    }
                    return next();
                });
            


        },
        render_remove:function(req, res, next){
            res.render('model/subscription_detail', res.locals.subscription);
        },
        render_list:function(req, res, next){
            res.render('model/subscription_list', res.locals.subscriptions);
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
					entity_type:"Subscription"
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



			
			



            
                
                
            
                
                    if(req.query.short_namespace){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.short_namespace);
						req._list_query['short_namespace'] =   { $regex: new RegExp('^' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.type){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.type);
						req._list_query['type'] =   { $regex: new RegExp('^' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_url){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.entity_url);
						req._list_query['entity_url'] =   { $regex: new RegExp('^' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_type){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.entity_type);
						req._list_query['entity_type'] =   { $regex: new RegExp('^' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.entity_id){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.entity_id);
						req._list_query['entity_id'] =   { $regex: new RegExp('^' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.data){
                        var escpaedField = app.njax.helpers.regex.escape(req.query.data);
						req._list_query['data'] =   { $regex: new RegExp('^' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query._entity_name){
                        var escpaedField = app.njax.helpers.regex.escape(req.query._entity_name);
						req._list_query['_entity_name'] =   { $regex: new RegExp('^' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query._entity_namespace){
                        var escpaedField = app.njax.helpers.regex.escape(req.query._entity_namespace);
						req._list_query['_entity_namespace'] =   { $regex: new RegExp('^' + escpaedField + '', 'i') };
                    }
                
            
                
                    if(req.query.application){
                        req._list_query['application'] = req.query.application;
                    }
                
            
                
				if(req.user){
					req._list_query['account'] = req.user._id;
                }else if(req.query.account){
                    if(app.njax.helpers.regex.isHexKey(req.query.account)){
						req._list_query['account'] = req.query.account;
                    }
                }
                
            



            return next();
        },
        populate_list:function(req, res, next){
            var query = req._list_query;
            if(!query){
                return next();
            }
            var subscriptions = null;
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

                                        
                                            event_filters:'$event_filters',
                                        
                                            short_namespace:'$short_namespace',
                                        
                                            type:'$type',
                                        
                                            entity_url:'$entity_url',
                                        
                                            entity_type:'$entity_type',
                                        
                                            entity_id:'$entity_id',
                                        
                                            data:'$data',
                                        
                                            _entity_name:'$_entity_name',
                                        
                                            _entity_namespace:'$_entity_namespace',
                                        
                                            application:'$application',
                                        
                                            account:'$account',
                                        

                                        _query_field: { $toLower: '$' + orderby_parts[0] }

                                    }
                                },
                                {
                                    $sort: orderby_data
                                }
                            ];

                            return app.model.Subscription.aggregate(
                                agg_query
                            ).exec(function(err, _subscriptions_data){
                                if(err) return next(err);
                                res.bootstrap('subscriptions', _subscriptions_data);
                                return next();
                            });

                        }





                        app.model.Subscription.find(query, function(err, _subscriptions){
                            if(err) return next(err);
                            subscriptions = _subscriptions;
							res.bootstrap('subscriptions', subscriptions);
                            return cb();
                        });
                    
                },
                function(cb){
                    res.locals.subscriptions = [];
                    for(var i in subscriptions){
                        var subscription_data = subscriptions[i].toObject();
                        
                        res.locals.subscriptions.push(
                            subscription_data
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
            if(!req.subscription){
                return next();
            }

            

            res.render('model/subscription_detail', req.subscription.toObject());
        },
        redirect_detail:function(req, res, next){
  			if(!req.subscription){
                return next();
            }
            if(req.njax.call_type == 'www'){
				return res.redirect(req.subscription.uri);
            }
            return route.render_detail(req, res, next);

        },
        redirect_edit:function(req, res, next){
  			if(!req.subscription){
                return next();
            }

            res.redirect(req.subscription.uri + '/edit');
        },
        render_edit:function(req, res, next){
            async.series([
                function(cb){
                    if(!req.subscription){
                        //return next();
                        req.subscription = new app.model.Subscription();
                    }
                    return cb();
                },
                
                
                
                
                
                function(cb){

                    res.render('model/subscription_edit');
                }
            ]);
        },
        create:function(req, res, next){

            if(!req.subscription){
                req.subscription = new app.model.Subscription({
                    
                            application:(req.application && req.application._id || null),
                    
                            account:(req.user && req.user._id || null),
                    
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){

            if(!req.subscription){
                return next();
                //return next(new Error('Subscription not found'));
            }

            
                
                    //Do nothing it is an array
                    //req.subscription.event_filters = req.body.event_filters;
                
            
                
					if(!_.isUndefined(req.body.short_namespace)){
                    	req.subscription.short_namespace = req.body.short_namespace;
					}
                
            
                
					if(!_.isUndefined(req.body.type)){
                    	req.subscription.type = req.body.type;
					}
                
            
                
					if(!_.isUndefined(req.body.entity_url)){
                    	req.subscription.entity_url = req.body.entity_url;
					}
                
            
                
					if(!_.isUndefined(req.body.entity_type)){
                    	req.subscription.entity_type = req.body.entity_type;
					}
                
            
                
					if(!_.isUndefined(req.body.entity_id)){
                    	req.subscription.entity_id = req.body.entity_id;
					}
                
            
                
                	if(!_.isUndefined(req.body.data)){
                    	req.subscription.data = req.body.data;
                    	req.subscription.markModified('data');
					}
                
            
                
					if(!_.isUndefined(req.body._entity_name)){
                    	req.subscription._entity_name = req.body._entity_name;
					}
                
            
                
					if(!_.isUndefined(req.body._entity_namespace)){
                    	req.subscription._entity_namespace = req.body._entity_namespace;
					}
                
            
                
                	
						if(req.application){
							req.subscription.application = req.application._id;
						}else if(!_.isUndefined(req.body.application)){
							req.subscription.application = req.body.application;
						}
					
                
            
                
                	
						if(req.user){
							req.subscription.account = req.user._id;
						}else if(!_.isUndefined(req.body.account)){
							req.subscription.account = req.body.account;
						}
					
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.subscription){
                return next();
            }
            req.subscription.save(function(err, subscription){
				if(err){
					return next(err);
				}
                //app._refresh_locals();
                res.bootstrap('subscription', req.subscription);
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
			if(!req.subscription){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.subscription,
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
			app.njax.tags.query(req.subscription, function(err, tags){
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
            if(!req.subscription){
                return next(new Error(404));
            }
            //TODO: Add validation
            return app.njax.subscription.add(
                req.user,
                req.subscription,
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
            app.njax.subscription.query(req.subscription, function(err, subscriptions){
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
			if(!req.subscription){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.subscription,
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
			app.njax.events.query(req.subscription, function(err, events){
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
