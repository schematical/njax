var async = require('async');
var _ = require('underscore');
var path = require('path');
module.exports = function(app){
    var njax_broadcast = /*{
     broadcast:*/function(accounts, event, data, application_id){
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


                for(var i in accounts){
                    var account = accounts[i];
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

                    account.authed_apps.get(function(err, applications){//TODO: Eventually check permissions vs the event
                        if(err) throw err;
                        applications = _.union(applications, super_applications);
                        console.log("Sending to applications. Count(" + applications.length + ")");
                        async.eachSeries(applications, function(application, cb){
                            //Gather callback uris
                            if(!application.callback_url){
                                return cb();
                            }
                            data._callback_url = application.callback_url;
                            //Trigger child_process
                            var worker = app.njax.cp.spawn(
                                path.join(
                                    app.njax.config.njax_dir,
                                    '/lib/modules/broadcast/broadcast_worker'
                                )
                            );

                            worker.on('broadcast_success', function(data){
                                console.log("BroadCastSuccess:", data);
                                return cb();
                            });
                            worker.on('broadcast_error', function(data){
                                console.error("BroadCastError:", data);
                                return cb();
                            });
                            worker.send('broadcast', data);
                        });
                    });
                }
            }
        ],
        function(){

            //This never actually gets hit
        });


    }
    /*  }*/
    return njax_broadcast;
}