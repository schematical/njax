'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            event_namespace:{ type:String },
        
    
        
            short_namespace:{ type:String },
        
    
        
            entity_url:{ type:String },
        
    
        
            data:{"type":"Object"},
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        
            accounts:{},
        
    
        creDate:Date
    };

    var eventSchema = new Schema(fields);

    eventSchema.virtual('uri').get(function(){
        
            
                return '/events/' + this._id;
            
        
    });

    
        

    
        

    
        

    
        

    
        

    
        

    

    



    eventSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        return next();
    });

    if (!eventSchema.options.toObject) eventSchema.options.toObject = {};
    eventSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
        }
        ret.url = app.njax.config.domain + port_str + doc.uri;
        
            ret.api_url = app.njax.config.core.api.host  + doc.uri;
        
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
    }

    return eventSchema;
}