'use strict';
var fs = require('fs');
var async = require('async');
var passport = require('passport');
var passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(app){
    
    var accountSchema = require('./_gen/account_gen')(app);
    
    /*
    Custom Code goes here
    */


    accountSchema.plugin(passportLocalMongoose, { usernameField:'email', usernameLowerCase:true});


    accountSchema.virtual('authed_apps').get(function(){
        var _this = this;
        return {
            get:function(callback){
                //Load AuthTokens populate Applications
                app.model.AccessToken.find(
                    {
                        account: this._id//,
                        //TODO: Add expirationDate check
                    })
                    .populate('application')
                    .exec(function(err, access_tokens){
                        if(err) return callback(err);
                        var applications = [];
                        for(var i in access_tokens){
							if(access_tokens[i].application){
                            	applications.push(access_tokens[i].application);
							}else{
								console.error("No application associated with thie access token:" + access_tokens[i]._id);
							}
                        }
                        return callback(null, applications)
                    });
            }
        }

    });
	accountSchema.virtual('subscriptions').get(function(){
		var _this = this;
		return {
			add:function(entity, entity_data, callback){
				return app.njax.subscription.add(_this, entity, entity_data, callback);
			},
			get:function(query, callback){
				if(_.isFunction(query)){
					callback = query;
					query = {}
				}
				query.account = this._id;
				return app.njax.subscription.query(query, callback)
			}
		}

	});



    accountSchema._passport = passport;
    accountSchema._LocalStrategy = LocalStrategy;


	if (!accountSchema.options.toObject) accountSchema.options.toObject = {};
	accountSchema.options.toObject.transform = function (doc, ret, options) {
		ret.uri = doc.uri;
		var port_str = '';
		delete(ret.hash);
		delete(ret.salt);
		if(!app.njax.config.hide_port){
			port_str = ':' + app.njax.config.port;
		}
		ret.url = app.njax.config.domain + port_str + doc.uri;

		ret.api_url = app.njax.config.core.api.host  + doc.uri;

		ret._njax_type = doc._njax_type;
		ret.creDate = doc.creDate;
		if(doc.creDate){
			ret.creDate_iso = doc.creDate.toISOString();
		}

	}


    /*
     * END CUSTOM CODE
     *
     */


    return accountSchema;

}