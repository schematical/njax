'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            code:{ type:String },
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        creDate:Date
    };

    var requestcodeSchema = new Schema(fields);
	requestcodeSchema.virtual('_njax_type').get(function(){
		return 'RequestCode';
	});
    requestcodeSchema.virtual('uri').get(function(){
        
            
                return '/request_codes/' + this._id;
            
        
    });

    
        

    
        

    

    



    requestcodeSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        return next();
    });



     requestcodeSchema.virtual('tags').get(function(){
		return function(callback){
			return app.njax.tag.query(this, callback);
		}
	});
	requestcodeSchema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tag.add(tag_data, this, callback);
		}
	});



    requestcodeSchema.virtual('url').get(function(){
     	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		return app.njax.config.domain + port_str + this.uri;
	});

   requestcodeSchema.virtual('api_url').get(function(){
    	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		
           return app.njax.config.core.api.host  + this.uri;
        
	});


    if (!requestcodeSchema.options.toObject) requestcodeSchema.options.toObject = {};
    requestcodeSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;

        ret.url = doc.url;
        ret.api_url = doc.api_url;
        
            

            
        
            

            
        
    }

    return requestcodeSchema;
}