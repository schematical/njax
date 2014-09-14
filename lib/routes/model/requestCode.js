var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(app){

    var route = require('./_gen/requestCode')(app);
    /**
     * Custom Code Goes here
     */
    return route;

}