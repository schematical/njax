var async = require('async');
var _ = require('underscore');
var path = require('path');
module.exports = function(app){
    var njax_broadcast = /*{
        broadcast:*/function(accounts, event, data, application_id){
            if(!application_id){
                //Assume it is the core app
                application_id = app.njax.config.core_app;
            }
            //TODO:Should probablly log this somewhere

            if(!_.isArray(accounts)){
                accounts = [accounts];
            }
            for(var i in accounts){
                var account = accounts[i];
                //Add event and account to data
                if(!account.toObject){
                    console.error("Missing Account Object:", account);
                    throw new Error("Invalid Account object passed in");
                }
                data.account = account;//.toObject();//TODO: Add validation
                if(!event.substr(0, application_id.length) == application_id){
                    event = application_id  + '.' + event;
                }
                data.event = event;
                //Load default apps?
                var super_applications = app.njax.super_applications;//TODO: Load Superlevel apps -> Better yet load these when you kick off NJax and have them ready
                //Load Apps by account

                account.authed_apps.get(function(err, applications){//TODO: Eventually check permissions vs the event
                    applications = _.union(applications, super_applications);

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
                        worker.send('broadcast', data);
                        worker.on('broadcast_success', function(data){
                            console.log("BroadCastSuccess:", data);
                            return cb();
                        });
                        worker.on('broadcast_error', function(data){
                            console.error("BroadCastError:", data);
                            return cb();
                        });
                    });
                });

            }
        }
  /*  }*/
    return njax_broadcast;
}