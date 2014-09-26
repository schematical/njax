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

    if (!applicationSchema.options.toObject) applicationSchema.options.toObject = {};
    applicationSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
        }
        ret.url = app.njax.config.domain + port_str + doc.uri;
        ret.api_url = app.njax.config.core.api.prefix +  ret.url;
        
            

            
        
            

            
        
            
                ret.desc = doc.desc_rendered;
                ret.desc_raw = doc.desc_raw;
            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
            

            
        
    }

    return applicationSchema;
}