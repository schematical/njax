'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var _ = require('underscore');

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
        
    
        
            level:{"type":"String"},
        
    
        
            callback_url:{ type:String },
        
    
        
            iframes:{"type":"Object"},
        
    
        
            bootstrap_data:{"type":"Object"},
        
    
        
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
                return this.desc_raw;
            }).set(function(value){
                if(!value || value.length == 0){
                    return false;
                }
                var markdown = require('markdown').markdown;
                this.desc_raw = value;
                this.desc_rendered = markdown.toHTML(value);
            });
        

    
        

    
        

    
        

    
        
			 applicationSchema.virtual('level_tpcds').get(function(){
				return {
					
						SUPER:'super',
					
						PARTNER:'partner',
					
						UNKNOWN:'unknown',
					
						FEATURED:'featured',
					
						BETA:'beta',
					
						ALPHA:'alpha',
					
						LAB:'lab',
					
						DEV:'dev',
					
				}
			});

				applicationSchema.path('level').validate(function (value) {
  					return /SUPER|PARTNER|UNKNOWN|FEATURED|BETA|ALPHA|LAB|DEV/.test(value);
				}, 'Invalid level');

        
            applicationSchema.virtual('is_SUPER').get(function(){
                return (this.level == 'SUPER');
            });
        
            applicationSchema.virtual('is_PARTNER').get(function(){
                return (this.level == 'PARTNER');
            });
        
            applicationSchema.virtual('is_UNKNOWN').get(function(){
                return (this.level == 'UNKNOWN');
            });
        
            applicationSchema.virtual('is_FEATURED').get(function(){
                return (this.level == 'FEATURED');
            });
        
            applicationSchema.virtual('is_BETA').get(function(){
                return (this.level == 'BETA');
            });
        
            applicationSchema.virtual('is_ALPHA').get(function(){
                return (this.level == 'ALPHA');
            });
        
            applicationSchema.virtual('is_LAB').get(function(){
                return (this.level == 'LAB');
            });
        
            applicationSchema.virtual('is_DEV').get(function(){
                return (this.level == 'DEV');
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
			return app.njax.tags.query(this, callback);
		}
	});
	applicationSchema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tags.add(tag_data, this, callback);
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

        
            

            
        
            

            
        
            
                ret.desc_rendered = doc.desc_rendered;
                ret.desc_raw = doc.desc_raw;
            
        
            

            
        
            

            
        
            

            
        
            
                
                    ret.is_SUPER = doc.is_SUPER;
                
                    ret.is_PARTNER = doc.is_PARTNER;
                
                    ret.is_UNKNOWN = doc.is_UNKNOWN;
                
                    ret.is_FEATURED = doc.is_FEATURED;
                
                    ret.is_BETA = doc.is_BETA;
                
                    ret.is_ALPHA = doc.is_ALPHA;
                
                    ret.is_LAB = doc.is_LAB;
                
                    ret.is_DEV = doc.is_DEV;
                

			
        
            

            
        
            
				ret.iframes = doc.iframes;
			
        
            
				ret.bootstrap_data = doc.bootstrap_data;
			
        
            

            
        

		ret.creDate = doc.creDate;
		if(doc.creDate){
			ret.creDate_iso = doc.creDate.toISOString();
		}
    }

    return applicationSchema;
}