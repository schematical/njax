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
        
    
        
            entity_type:{ type:String },
        
    
        
            data:{"type":"Object"},
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        
            accounts:{},
        
    
        creDate:Date
    };

    var eventSchema = new Schema(fields);
	eventSchema.virtual('_njax_type').get(function(){
		return 'Event';
	});
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



     eventSchema.virtual('tags').get(function(){
		return function(callback){
			return app.njax.tag.query(this, callback);
		}
	});
	eventSchema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tag.add(tag_data, this, callback);
		}
	});



    eventSchema.virtual('url').get(function(){
     	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		return app.njax.config.domain + port_str + this.uri;
	});

   eventSchema.virtual('api_url').get(function(){
    	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		
           return app.njax.config.core.api.host  + this.uri;
        
	});


    if (!eventSchema.options.toObject) eventSchema.options.toObject = {};
    eventSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;

        ret.url = doc.url;
        ret.api_url = doc.api_url;
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
    }

    return eventSchema;
}