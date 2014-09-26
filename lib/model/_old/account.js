'use strict';
var passport = require('passport');
var passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy = require('passport-local').Strategy;



module.exports = function(app){
    var mongoose = app.mongoose;
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;
    var fields = {
        _id: { type: Schema.Types.ObjectId },
        email: { type: String },
        name: { type: String },
        namespace: { type: String },
        creDate: { type: Date , default: Date.now }
    };

    var accountSchema = new Schema(fields);

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
                            applications.push(access_tokens[i].application);
                        }
                        return callback(null, applications)
                    });
            }
        }

    });
    accountSchema.virtual('uri').get(function(){
        var uri = '/' + (this.namespace || this._id.toString());
        //var uri = '/accounts/' + (this.username || this._id.toString());
        return uri;

    });
    accountSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
        }
        return next();
    });

    if (!accountSchema.options.toObject) accountSchema.options.toObject = {};
    accountSchema.options.toObject.transform = function (doc, ret, options) {
        delete(ret['salt']);
        delete(ret['hash']);
        ret.uri = doc.uri;
        ret.url = app.njax.config.domain + ':' + (app.njax.config.public_port || app.njax.config.port) + doc.uri;
        ret.api_url = 'api.' +  ret.url;
    };


    accountSchema._passport = passport;
    accountSchema._LocalStrategy = LocalStrategy;

    return accountSchema;
  /*  var AccountModel = mongoose.model('Account', accountSchema);



    // use static authenticate method of model in LocalStrategy
    passport.use(new LocalStrategy(AccountModel.authenticate()));

    // use static serialize and deserialize of model for passport session support
    passport.serializeUser(AccountModel.serializeUser());
    passport.deserializeUser(AccountModel.deserializeUser());


    return AccountModel;*/
}