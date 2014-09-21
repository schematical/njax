'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){
    
    var applicationSchema = require('./_gen/application_gen')(app);
    
    /*
    Custom Code goes here
    */

    return  applicationSchema;
}