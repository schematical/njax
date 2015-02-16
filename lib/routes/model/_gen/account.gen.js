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
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = 'account';
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
						req.njax.entity = 'account';
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
                uri + '/:account',
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'update';
						req.njax.entity = 'account';
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

            app.all(uri + '/:account', [
                route.auth_query_detail,
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:account/edit', [
            	function(req, res, next){
					if(!req.account){
						return next(new Error(404));
					}
					return next();
            	},
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);
            
            	app.post(uri +  '/:account/tags',[
            		route.validate_tag,
					route.create_tag,
					route.broadcast_update,
					route.render_tag
				]);
				app.delete(uri +  '/:account/tags/:tag',[
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
				app.all(uri +  '/:account/tags',[
                    route.auth_query_tags,
					route.list_tags,
					route.render_tags
				]);
				app.all(uri +  '/:account/tags/:tag',[
                    route.auth_update,
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.render_tag
				]);




                app.post(uri +  '/:account/subscriptions',[
                    route.auth_create_subscription,
                    route.create_subscription,
                    route.render_subscription_list
                ]);
                app.delete(uri +  '/:account/subscriptions/:subscription',[
                    function(req, res, next){
                        if(!req.subscription){
                            return next(new Error(404));
                        }
                        return next();
                    },
                    route.remove_subscription,
                    route.render_subscription_detail
                ]);
                app.all(uri +  '/:account/subscriptions',[
                    route.auth_query_subscription,
                    route.list_subscription,
                    route.render_subscription_list
                ]);
                app.all(uri +  '/:account/subscriptions/:subscription',[
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
				app.post(uri +  '/:account/events',[
					route.create_event,
					route.broadcast_event,
					route.render_tag
				]);
				//We dont need to remove events at this point
				app.delete(uri +  '/:account/events/:event',[
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

				app.all(uri +  '/:account/events',[
                    route.auth_query_detail,
					route.list_events,
					route.render_events
				]);
				app.all(uri +  '/:account/events/:event',[
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
            res.render('model/account_detail', res.locals.account);
        },
        render_list:function(req, res, next){
            res.render('model/account_list', res.locals.accounts);
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
					entity_type:"Account"
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
            
                
                    if(req.query.email){
						req._list_query['email'] =   { $regex: new RegExp('^' + req.query.email + '', 'i') };
                    }
                
            
                
                    if(req.query.name){
						req._list_query['name'] =   { $regex: new RegExp('^' + req.query.name + '', 'i') };
                    }
                
            
                
                    if(req.query.namespace){
						req._list_query['namespace'] =   { $regex: new RegExp('^' + req.query.namespace + '', 'i') };
                    }
                
            
                
                    if(req.query.active) {
                        req._list_query['active'] = (req.query.active.toLowerCase() === 'true');
                    }
                
            
                
                    if(req.query.forgot_pass_code){
						req._list_query['forgot_pass_code'] =   { $regex: new RegExp('^' + req.query.forgot_pass_code + '', 'i') };
                    }
                
            



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
                    




                        if(req.query.$orderby){
                            var orderby_parts = req.query.$orderby.split(':');
                            var orderby_data = {};
                            orderby_data['_query_field'] = (typeof(orderby_parts[1]) != 'undefined' && parseInt(orderby_parts[1])) || 1;
                            var agg_query = [
                                { $match:query },
                                {
                                    $project: {

                                        
                                            email:'$email',
                                        
                                            name:'$name',
                                        
                                            namespace:'$namespace',
                                        
                                            active:'$active',
                                        
                                            forgot_pass_code:'$forgot_pass_code',
                                        

                                        _query_field: { $toLower: '$' + orderby_parts[0] }

                                    }
                                },
                                {
                                    $sort: orderby_data
                                }
                            ];

                            return app.model.Account.aggregate(
                                agg_query
                            ).exec(function(err, _accounts_data){
                                if(err) return next(err);
                                res.bootstrap('accounts', _accounts_data);
                                return next();
                            });

                        }





                        app.model.Account.find(query, function(err, _accounts){
                            if(err) return next(err);
                            accounts = _accounts;
							res.bootstrap('accounts', accounts);
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
        redirect_detail:function(req, res, next){
  			if(!req.account){
                return next();
            }
            if(req.njax.call_type == 'www'){
				return res.redirect(req.account.uri);
            }
            return route.render_detail(req, res, next);

        },
        redirect_edit:function(req, res, next){
  			if(!req.account){
                return next();
            }

            res.redirect(req.account.uri + '/edit');
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

            
                
					if(!_.isUndefined(req.body.email)){
                    	req.account.email = req.body.email;
					}
                
            
                
					if(!_.isUndefined(req.body.name)){
                    	req.account.name = req.body.name;
					}
                
            
                
					if(!_.isUndefined(req.body.namespace)){
                    	req.account.namespace = req.body.namespace;
					}
                
            
                
					if(!_.isUndefined(req.body.active)){
                    	req.account.active = req.body.active;
					}
                
            
                
					if(!_.isUndefined(req.body.forgot_pass_code)){
                    	req.account.forgot_pass_code = req.body.forgot_pass_code;
					}
                
            

            return next();

        },
        update_save:function(req, res, next){
            if(!req.account){
                return next();
            }
            req.account.save(function(err, account){
				if(err){
					return next(err);
				}
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
		validate_tag:function(req, res, next){
			if(!req.body.type){
				return next(new Error("Ivalid type"));
			}
			return next();
		},
		create_tag:function(req, res, next){
			if(!req.account){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.account,
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
			app.njax.tags.query(req.account, function(err, tags){
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
            if(!req.account){
                return next(new Error(404));
            }
            //TODO: Add validation
            return app.njax.subscription.add(
                req.user,
                req.account,
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
            app.njax.subscription.query(req.account, function(err, subscriptions){
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
			if(!req.account){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.account,
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
			app.njax.events.query(req.account, function(err, events){
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
