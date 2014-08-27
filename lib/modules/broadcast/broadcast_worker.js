var NJaxWorker = require('./../child_process/worker');
var request = require('request');
var NJaxBCWorker = new NJaxWorker({ });
NJaxBCWorker.on('broadcast', function(event, data, worker){
    //Trigger a http request
    console.log("Child.broadcast... ENDO OF THE LINE");//, data);

    request(
        {
            method: 'POST',
            uri: data._callback_url,
            //body:
            json: data
        },
        _.bind(this.onRequest_finish, this)
    )

});
NJaxBCWorker.prototype.onRequest_finish = function (err, response, body) {
    if(response.statusCode == 201){
        this.send('broadcast_success', body);//NOTE: It doesnt really matter what their response is
    } else {
        this.send('broadcast_error',{ error: response.statusCode, body:body });
        /*console.log('error: '+ response.statusCode)
        console.log(body)*/
    }
}