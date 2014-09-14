var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(app){

    var route = require('./_gen/accessToken')(app);
    /**
     * Custom Code Goes here
     */
    return route;

}