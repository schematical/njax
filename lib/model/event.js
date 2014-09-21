'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){
    
        var eventSchema = require('./_gen/event_gen')(app);
    
    /*
    Custom Code goes here
    */

    return eventSchema;
}