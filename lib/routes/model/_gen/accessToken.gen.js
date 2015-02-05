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
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = 'accessToken';
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
						req.njax.entity = 'accessToken';
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
                uri + '/:accesstoken',
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'update';
						req.njax.entity = 'accessToken';
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

            app.all(uri + '/:accesstoken', [
                route.auth_query_detail,
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:accesstoken/edit', [
            	function(req, res, next){
					if(!req.accessToken){
						return next(new Error(404));
					}
					return next();
            	},
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);
            
            	app.post(uri +  '/:accesstoken/tags',[
            		route.validate_tag,
					route.create_tag,
					route.broadcast_update,
					route.render_tag
				]);
				app.delete(uri +  '/:accesstoken/tags/:tag',[
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
				app.all(uri +  '/:accesstoken/tags',[
                    route.auth_query_tags,
					route.list_tags,
					route.render_tags
				]);
				app.all(uri +  '/:accesstoken/tags/:tag',[
                    route.auth_update,
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.render_tag
				]);




                app.post(uri +  '/:accesstoken/subscriptions',[
                    route.auth_create_subscription,
                    route.create_subscription,
                    route.render_subscription_list
                ]);
                app.delete(uri +  '/:accesstoken/subscriptions/:subscription',[
                    function(req, res, next){
                        if(!req.subscription){
                            return next(new Error(404));
                        }
                        return next();
                    },
                    route.remove_subscription,
                    route.render_subscription_detail
                ]);
                app.all(uri +  '/:accesstoken/subscriptions',[
                    route.auth_query_subscription,
                    route.list_subscription,
                    route.render_subscription_list
                ]);
                app.all(uri +  '/:accesstoken/subscriptions/:subscription',[
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
				app.post(uri +  '/:accesstoken/events',[
					route.create_event,
					route.broadcast_event,
					route.render_tag
				]);
				//We dont need to remove events at this point
				app.delete(uri +  '/:accesstoken/events/:event',[
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

				app.all(uri +  '/:accesstoken/events',[
                    route.auth_query_detail,
					route.list_events,
					route.render_events
				]);
				app.all(uri +  '/:accesstoken/events/:event',[
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
        populate_subscription_query:function(req, res, next){



            return app.njax.subscription.query(
                {
                    type:req.query.type,
                    entity_type:"AccessToken",
                    entity_id:req.accessToken._id,
                    entity_url:req.accessToken.api_url
                },
                function(err, subscriptions){
                    if(err) return next(err);
                    res.bootstrap('subscriptions', subscriptions);
                    return next();
                }
            );

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
					entity_type:"AccessToken"
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
            
                
                
            
                
                    if(req.query.token){
						req._list_query['token'] =   { $regex: new RegExp('^' + req.query.token + '', 'i') };
                    }
                
            
                
                    if(req.query.application){
                        req._list_query['application'] = req.query.application;
                    }
                
            
                
                    if(req.query.account){
                        req._list_query['account'] = req.query.account;
                    }
                
            



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
							res.bootstrap('accessTokens', accessTokens);
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
        redirect_detail:function(req, res, next){
  			if(!req.accessToken){
                return next();
            }
            if(req.njax.call_type == 'www'){
				return res.redirect(req.accessToken.uri);
            }
            return route.render_detail(req, res, next);

        },
        redirect_edit:function(req, res, next){
  			if(!req.accessToken){
                return next();
            }

            res.redirect(req.accessToken.uri + '/edit');
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

                    res.render('model/accessToken_edit');
                }
            ]);
        },
        create:function(req, res, next){

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
                
            
                
					if(!_.isUndefined(req.body.token)){
                    	req.accessToken.token = req.body.token;
					}
                
            
                
                	
						if(req.application){
							req.accessToken.application = req.application._id;
						}else if(!_.isUndefined(req.body.application)){
							req.accessToken.application = req.body.application;
						}
					
                
            
                
                	
						if(req.user){
							req.accessToken.account = req.user._id;
						}else if(!_.isUndefined(req.body.account)){
							req.accessToken.account = req.body.account;
						}
					
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.accessToken){
                return next();
            }
            req.accessToken.save(function(err, accessToken){
				if(err){
					return next(err);
				}
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
		validate_tag:function(req, res, next){
			if(!req.body.type){
				return next(new Error("Ivalid type"));
			}
			return next();
		},
		create_tag:function(req, res, next){
			if(!req.accessToken){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.accessToken,
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
			app.njax.tags.query(req.accessToken, function(err, tags){
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
            if(!req.accessToken){
                return next(new Error(404));
            }
            //TODO: Add validation
            return app.njax.subscription.add(
                req.user,
                req.accessToken,
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
            app.njax.subscription.query(req.accessToken, function(err, subscriptions){
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
			if(!req.accessToken){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.accessToken,
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
			app.njax.events.query(req.accessToken, function(err, events){
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
