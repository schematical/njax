var async = require('async');
var _ = require('underscore');
var path = require('path');
module.exports = function(app){
    var njax_broadcast = /*{
        broadcast:*/function(accounts, event, data){
            //TODO:Should probablly log this somewhere
            if(_.isArray(accounts)){
                accounts = [accounts];
            }
            for(var i in accounts){
                var account = accounts[i];
                //Add event and account to data
                data.account = account;//.toObject();//TODO: Add validation
                data.event = event;
                //Load default apps?

                //Load Apps by account
                account.authed_apps.get(function(err, applications){

                    async.eachSeries(applications, function(application, cb){
                        //Gather callback uris

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