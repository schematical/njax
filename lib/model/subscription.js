'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){
    
        var subscriptionSchema = require('./_gen/subscription_gen')(app);
    
    /*
    Custom Code goes here
    */

    return subscriptionSchema;
}