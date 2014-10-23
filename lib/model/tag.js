'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){
    
        var tagSchema = require('./_gen/tag_gen')(app);
    
    /*
    Custom Code goes here
    */

    return app.mongoose.model('Tag', tagSchema);
}