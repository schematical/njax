'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){
    
        var requestcodeSchema = require('./_gen/requestCode_gen')(app);
    
    /*
    Custom Code goes here
    */

    return  requestcodeSchema;
}