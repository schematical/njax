'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            email:{ type:String },
        
    
        
            name:{ type:String },
        
    
        
            namespace:{ type:String },
        
    
        
            active:{"type":"Boolean"},
        
    
        
            forgot_pass_code:{ type:String },
        
    
        creDate:Date
    };

    var accountSchema = new Schema(fields);

    accountSchema.virtual('uri').get(function(){
        
            
                return '/' + (this.namespace || this._id);
            
        
    });

    
        

    
        

    
        

    
        

    
        

    

    



    accountSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        return next();
    });

    if (!accountSchema.options.toObject) accountSchema.options.toObject = {};
    accountSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        ret.url = app.njax.config.domain + ':' + (app.njax.config.public_port || app.njax.config.port) + doc.uri;
        ret.api_url = 'api.' +  ret.url;
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
    }

    return accountSchema;
}