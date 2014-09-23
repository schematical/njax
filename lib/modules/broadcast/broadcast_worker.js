var NJaxWorker = require('../../../node_modules/njax-util').cpWorker;
var request = require('request');
var async = require('async');
var _ = require('underscore');
var NJaxBCWorker = new NJaxWorker({ });
NJaxBCWorker.on('broadcast', _.bind(function(event, data, worker){
    //Trigger a http request

    console.log("BroadCast Worker - Sending:", data)
    request(
        {
            method: 'POST',
            uri: data._callback_url,
            //body:
            json: data
        },
        _.bind(this.onRequest_finish, this)
    )

}, NJaxBCWorker));
NJaxBCWorker./*prototype.*/onRequest_finish = function (err, response, body) {

    if(!err /*&& response.statusCode == 200*/){
        this.send('broadcast_success', body);//NOTE: It doesnt really matter what their response is
    } else {

        this.send('broadcast_error', { error: { message: err.message   } });

        /* console.log(body)*/
    }
}