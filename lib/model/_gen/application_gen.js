'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            namespace:{ type:String },
        
    
        
            name:{ type:String },
        
    
        
            desc_raw:String,
            desc_rendered:String,
        
    
        
            app_url:{ type:String },
        
    
        
            domain:{ type:String },
        
    
        
            secret:{ type:String },
        
    
        
            level:{},
        
    
        
            callback_url:{ type:String },
        
    
        
            iframes:{"type":"Object"},
        
    
        
            owner:{ type: Schema.Types.ObjectId, ref: 'Account' },
        
    
        creDate:Date
    };

    var applicationSchema = new Schema(fields);
	applicationSchema.virtual('_njax_type').get(function(){
		return 'Application';
	});
    applicationSchema.virtual('uri').get(function(){
        
            
                return '/apps/' + (this.namespace || this._id);
            
        
    });

    
        

    
        

    
        
            applicationSchema.virtual('desc').get(function(){
                return this.desc_rendered;
            }).set(function(value){
                if(!value || value.length == 0){
                    return false;
                }
                var markdown = require('markdown').markdown;
                this.desc_raw = value;
                this.desc_rendered = markdown.toHTML(value);
            });
        

    
        

    
        

    
        

    
        

    
        

    
        

    
        

    

    



    applicationSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        return next();
    });

 	applicationSchema.virtual('events').get(function(){
		return function(callback){
			return app.njax.events.query(this, callback);
		}
	});


     applicationSchema.virtual('tags').get(function(){
		return function(callback){
			return app.njax.tag.query(this, callback);
		}
	});
	applicationSchema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tag.add(tag_data, this, callback);
		}
	});



    applicationSchema.virtual('url').get(function(){
     	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		return app.njax.config.domain + port_str + this.uri;
	});

   applicationSchema.virtual('api_url').get(function(){
    	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		
           return app.njax.config.core.api.host  + this.uri;
        
	});


    if (!applicationSchema.options.toObject) applicationSchema.options.toObject = {};
    applicationSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;

        ret.url = doc.url;
        ret.api_url = doc.api_url;
		ret._njax_type = doc._njax_type;

        
            

            
        
            

            
        
            
                ret.desc = doc.desc_rendered;
                ret.desc_raw = doc.desc_raw;
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            
				ret.iframes = doc.iframes;
			

            
        
            

            
        
    }

    return applicationSchema;
}