var async = require('async');
var _ = require('underscore');
var path = require('path');
module.exports = function(app){
    var njax_broadcast = {
        broadcast:function(accounts, event, data, application_id){
            if(!application_id){
                //Assume it is the core app
                application_id = app.njax.config.core.app;
            }
            //TODO:Should probablly log this somewhere
            if(event.substr(0, application_id.length) != application_id){
                event = application_id + '.' + event;
            }
            if(!_.isArray(accounts)){
                accounts = [accounts];
            }
            var application = null;
            async.series([
                function(cb){
                    //Load the app
                    //TODO: Cache core app
                    return app.model.Application.findOne({ namespace: application_id}).exec(function(err, _application){
                        if(err) throw err;//TODO: Possibly fail silently
                        application = _application;
                        return cb();
                    });
                },
                function(cb){

                    var eventObj = app.model.Event({
                        "event_namespace":event,
                        "entity_url":data._url,
                        "data":data,
                        "application": application._id
                    });
                    eventObj.accounts = [];
                    for(var i in accounts){
                        eventObj.accounts.push(accounts[i]._id);
                    }
                    return eventObj.save(function(err){
                        if(err) throw err;//TODO: Possibly fail quietly
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

                }
            ],
            function(){
                console.log("Successfully Finished Broadcast");
                //This never actually gets hit
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
                    data.email = account;
                }else{
                    data.account = account;//.toObject();//TODO: Add validation
                }
                data.event = event;
                //Load default apps?
                var super_applications = app.njax.super_applications;//TODO: Load Superlevel apps -> Better yet load these when you kick off NJax and have them ready
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
        spawnChildren:function(data){
            return function(application, cb){
                    //Gather callback uris
                    if(!application.callback_url){
                        return cb();
                    }
                    data._callback_url = application.callback_url;
                    console.log("Spawining: " + application.name + ' - ' + data._callback_url);
                    //Trigger child_process
                    var worker = app.njax.cp.spawn(
                        path.join(
                            app.njax.config.njax_dir,
                            '/lib/modules/broadcast/broadcast_worker'
                        )
                    );

                    worker.on('broadcast_success', function(data){
                        console.log("BroadCastSuccess:", application.name, data);
                        return cb();
                    });
                    worker.on('broadcast_error', function(data){
                        console.error("BroadCastError:", application.name, data);
                        return cb();
                    });
                    worker.send('broadcast', data);

            }
        }
  }
    return _.bind(njax_broadcast.broadcast, app);
}