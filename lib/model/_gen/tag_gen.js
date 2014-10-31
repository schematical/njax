'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            type:{ type:String },
        
    
        
            sub_type:{ type:String },
        
    
        
            value:{ type:String },
        
    
        
            entity_type:{ type:String },
        
    
        
            entity_url:{ type:String },
        
    
        
            entity_id:{ type:String },
        
    
        
            _entity_name:{},
        
    
        
            _entity_namespace:{},
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        
            account:{ type: Schema.Types.ObjectId, ref: 'Account' },
        
    
        creDate:Date
    };

    var tagSchema = new Schema(fields);
	tagSchema.virtual('_njax_type').get(function(){
		return 'Tag';
	});
    tagSchema.virtual('uri').get(function(){
        
            
                return '/tags/' + this._id;
            
        
    });

    
        

    
        

    
        

    
        

    
        

    
        

    
        

    
        

    
        

    
        

    

    



    tagSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        return next();
    });

 	tagSchema.virtual('events').get(function(){
		return function(callback){
			return app.njax.events.query(this, callback);
		}
	});


     tagSchema.virtual('tags').get(function(){
		return function(callback){
			return app.njax.tag.query(this, callback);
		}
	});
	tagSchema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tag.add(tag_data, this, callback);
		}
	});



    tagSchema.virtual('url').get(function(){
     	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		return app.njax.config.domain + port_str + this.uri;
	});

   tagSchema.virtual('api_url').get(function(){
    	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		
           return app.njax.config.core.api.host  + this.uri;
        
	});


    if (!tagSchema.options.toObject) tagSchema.options.toObject = {};
    tagSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;

        ret.url = doc.url;
        ret.api_url = doc.api_url;
		ret._njax_type = doc._njax_type;

        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
    }

    return tagSchema;
}