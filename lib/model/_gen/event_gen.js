'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var _ = require('underscore');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            event_namespace:{ type:String },
        
    
        
            short_namespace:{ type:String },
        
    
        
            entity_url:{ type:String },
        
    
        
            entity_type:{ type:String },
        
    
        
            entity_id:{ type:String },
        
    
        
            data:{"type":"Object"},
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        
            accounts:{},
        
    
        
            mutedDate:{"type":"Date","format":"date-time"},
        
    
		
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

 	eventSchema.virtual('events').get(function(){
		return function(callback){
			return app.njax.events.query(this, callback);
		}
	});


     eventSchema.virtual('tags').get(function(){
		return function(callback){
			return app.njax.tags.query(this, callback);
		}
	});
	eventSchema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tags.add(tag_data, this, callback);
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
		ret._njax_type = doc._njax_type;

        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            
				ret.data = doc.data;
			
        
            

            
        
            

            
        
            
				ret.mutedDate = doc.mutedDate;
				if(doc.mutedDate){
					ret.mutedDate_iso = doc.mutedDate.toISOString();
				}
            
        

		ret.creDate = doc.creDate;
		if(doc.creDate){
			ret.creDate_iso = doc.creDate.toISOString();
		}
    }

    return eventSchema;
}
