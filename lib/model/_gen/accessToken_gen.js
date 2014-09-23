'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            perms:{},
        
    
        
            token:{ type:String },
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        
            account:{ type: Schema.Types.ObjectId, ref: 'Account' },
        
    
        creDate:Date
    };

    var accesstokenSchema = new Schema(fields);

    accesstokenSchema.virtual('uri').get(function(){
        
            
                return '/access_tokens/' + this._id;
            
        
    });

    
        

    
        

    
        

    
        

    

    



    accesstokenSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        return next();
    });

    if (!accesstokenSchema.options.toObject) accesstokenSchema.options.toObject = {};
    accesstokenSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
        }
        ret.url = app.njax.config.domain + port_str + doc.uri;
        ret.api_url = 'api.' +  ret.url;
        
            

            
        
            

            
        
            

            
        
            

            
        
    }

    return accesstokenSchema;
}