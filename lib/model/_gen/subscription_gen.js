'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var _ = require('underscore');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            event_filters:["string"],
        
    
        
            short_namespace:{ type:String },
        
    
        
            entity_url:{ type:String },
        
    
        
            entity_type:{ type:String },
        
    
        
            entity_id:{ type:String },
        
    
        
            data:{"type":"Object"},
        
    
        
            account:{ type: Schema.Types.ObjectId, ref: 'Account' },
        
    
		
        creDate:Date
    };

    var subscriptionSchema = new Schema(fields);
	subscriptionSchema.virtual('_njax_type').get(function(){
		return 'Subscription';
	});
    subscriptionSchema.virtual('uri').get(function(){
        
            
                return '/subscription/' + this._id;
            
        
    });

    
        

    
        

    
        

    
        

    
        

    
        

    
        

    

    



    subscriptionSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        

        return next();

    });

 	subscriptionSchema.virtual('events').get(function(){
		return function(callback){
			return app.njax.events.query(this, callback);
		}
	});


     subscriptionSchema.virtual('tags').get(function(){
		return function(callback){
			return app.njax.tags.query(this, callback);
		}
	});
	subscriptionSchema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tags.add(tag_data, this, callback);
		}
	});



    subscriptionSchema.virtual('url').get(function(){
     	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		return app.njax.config.domain + port_str + this.uri;
	});

   subscriptionSchema.virtual('api_url').get(function(){
    	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		
           return app.njax.config.core.api.host  + this.uri;
        
	});


    if (!subscriptionSchema.options.toObject) subscriptionSchema.options.toObject = {};
    subscriptionSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;

        ret.url = doc.url;
        ret.api_url = doc.api_url;
		ret._njax_type = doc._njax_type;

        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            
				ret.data = doc.data;
			
        
            

            
        

		ret.creDate = doc.creDate;
		if(doc.creDate){
			ret.creDate_iso = doc.creDate.toISOString();
		}
    }

    return subscriptionSchema;
}