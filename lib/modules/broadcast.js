var async = require('async');
var _ = require('underscore');
var path = require('path');
module.exports = function(app){
    var njax_broadcast = {
        broadcast:function(accounts, event, data, application_id, callback){
			//TODO: Remove this hacky as balls fix
			if(data && data._event_tpls){
				delete(data._event_tpls);
			}
			if(_.isFunction(application_id)){
				callback = application_id;
				application_id = null;
			}
            if(!application_id){
                //Assume it is the core app
                application_id = app.njax.config.core.app;
            }

            if(event.substr(0, application_id.length) != application_id){
                event = application_id + '.' + event;
            }
            if(!_.isArray(accounts)){
                accounts = [accounts];
            }
			console.log("Broadcasting Events:" + event);
			var eventObj = null;
			var application = null;
            async.series([
                function(cb){
                    //Load the app
                    //TODO: Cache core app
                    return app.model.Application.findOne({ namespace: application_id}).exec(function(err, _application){
                        if(err) {
							if(callback){
								return callback(err);
							}else{
								console.error(err);
							}
						}//TODO: Possibly fail silently
                        application = _application;
                        return cb();
                    });
                },
                function(cb){
					var eventData = {
						"entity_type":data._entity_type,
						"event_namespace":event,
						"entity_url":data._url,
						"entity_id":data._id || (data[data._entity_type] && data[data._entity_type]._id),
						"data":data,
						"application": application._id
					}

					eventObj = app.model.Event(eventData);
                    eventObj.accounts = [];
                    for(var i in accounts){
                        if(accounts[i].toObject){
                            eventObj.accounts.push(accounts[i].toObject());
                        }else if(_.isString(accounts[i])){
                            eventObj.accounts.push({
                                email:accounts[i]
                            });
                        }
                    }
                    return eventObj.save(function(err){
						if(err) {
							if(callback){
								return callback(err);
							}else{
								console.error(err);
							}
						}//TODO: Possibly fail silently
                        return cb();
                    });
                },
                function(cb){

                    async.eachSeries(
                        accounts,
                        njax_broadcast.sendToAccounts(event, data),
                        function(errs){
                            return cb();
                        }
                    )

                },
				function(cb){

					return app.njax.cache.refresh(event, data, function(err, cache){
						if(err){
							console.error("Error Refreshing Cache After '" + event + " Broacast:");
							console.error(err);
						}
						return cb();
					});
				}
            ],
            function(){
                console.log("Successfully Finished Broadcast");
                //This never actually gets hit
				if(callback){
					return callback(null, eventObj);
				}
            });
        },
        sendToAccounts:function(event, data){
            return function(account, cb){

                //Add event and account to data
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                if(!account.toObject){
                    if(_.isString(account) && re.test(account)){

                    }else{
                        console.error("Missing Account Object:", account);
                        throw new Error("Invalid Account object passed in")
                    }
                    data._email = account;
                }else{
                    data._account = account;//.toObject();//TODO: Add validation
                }
                data._event = event;
                //Load default apps?
                var super_applications = app.njax.cache.super_applications;//TODO: Load Superlevel apps -> Better yet load these when you kick off NJax and have them ready
                //Load Apps by account
                var applications = super_applications;
                async.series([
                    function(cb){
                        if(!_.isObject(account)){
                            return cb();
                        }
                        account.authed_apps.get(function(err, _applications){//TODO: Eventually check permissions vs the event
                            if(err) throw err;
                            applications = _.union(_applications, applications);
                            console.log("Broadcasting '" + event + "' to applications. Count(" + applications.length + ")");
                            return cb();
                        });
                    },
                    function(cb){
                        async.each(
                            applications,
                            njax_broadcast.spawnChildren(data),
                            function(){
                                return cb();
                            }
                        );
                    }
                ],
                function(){
                    //end async
                    return cb();
                });
            }
        },
<<<<<<< HEAD
		sendToApplications:function(event, data, cb){
             data._event = event;
             //Load default apps?
             var super_applications = app.njax.cache.super_applications;//TODO: Load Superlevel apps -> Better yet load these when you kick off NJax and have them ready
             async.series([
                 function(cb){
                     async.each(
                         super_applications,
                         njax_broadcast.spawnChildren(data),
                         function(){
                             return cb();
                         }
                     );
                 }],
				 function(){
					 //end async
					 return cb();
				 });
        },
=======
>>>>>>> parent of c0bbd1d... can now trigger events without specifying an "account"
        spawnChildren:function(data){
            return function(application, cb){
                    //Gather callback uris
                    if(!application.callback_url){
                        return cb();
                    }
                    data._callback_url = application.callback_url;
                    console.log("Spawining: " + application.name + ' - ' + data.event + ' - ' + data._callback_url);
                    //Trigger child_process
                    var worker = app.njax.cp.spawn(
                        path.join(
                            app.njax.config.njax_dir,
                            '/lib/modules/broadcast/broadcast_worker'
                        )
                    );

                    worker.on('broadcast_success', function(data){
                        console.log("BroadCastSuccess:", application.name, data);
						worker.kill('SIGHUP');
                        return cb();
                    });
                    worker.on('broadcast_error', function(data){
                        console.error("BroadCastError:", application.name, data);
						worker.kill('SIGHUP');
                        return cb();
                    });
                    worker.send('broadcast', data);

            }
        }
  }
    return _.bind(njax_broadcast.broadcast, app);
}
