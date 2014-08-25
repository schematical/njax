var NJaxWorker = require('./worker');
var test = new NJaxWorker({ });
test.on('someshit', function(event, data, worker){
    console.error("Some Thit");
});