'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var _ = require('underscore');

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
	accountSchema.virtual('_njax_type').get(function(){
		return 'Account';
	});
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

 	accountSchema.virtual('events').get(function(){
		return function(callback){
			return app.njax.events.query(this, callback);
		}
	});


     accountSchema.virtual('tags').get(function(){
		return function(callback){
			return app.njax.tags.query(this, callback);
		}
	});
	accountSchema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tags.add(tag_data, this, callback);
		}
	});



    accountSchema.virtual('url').get(function(){
     	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		return app.njax.config.domain + port_str + this.uri;
	});

   accountSchema.virtual('api_url').get(function(){
    	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		
           return app.njax.config.core.api.host  + this.uri;
        
	});


    if (!accountSchema.options.toObject) accountSchema.options.toObject = {};
    accountSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;

        ret.url = doc.url;
        ret.api_url = doc.api_url;
		ret._njax_type = doc._njax_type;

        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        

		ret.creDate = doc.creDate;
		if(doc.creDate){
			ret.creDate_iso = doc.creDate.toISOString();
		}
    }

    return accountSchema;
}