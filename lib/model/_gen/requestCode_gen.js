'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            code:{ type:String },
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        creDate:Date
    };

    var requestcodeSchema = new Schema(fields);

    requestcodeSchema.virtual('uri').get(function(){
        
            
                return '/request_codes/' + this._id;
            
        
    });

    
        

    
        

    

    



    requestcodeSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        return next();
    });

    if (!requestcodeSchema.options.toObject) requestcodeSchema.options.toObject = {};
    requestcodeSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        ret.url = app.njax.config.domain + ':' + (app.njax.config.public_port || app.njax.config.port) + doc.uri;
        ret.api_url = 'api.' +  ret.url;
        
            

            
        
            

            
        
    }

    return requestcodeSchema;
}