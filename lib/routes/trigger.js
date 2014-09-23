/**
 This is intended to let other SUPER level apps trigger events
 */
var async = require('async');
var _ = require('underscore');
 module.exports = function(app){
       app.all(app.njax.config.trigger_uri, function(req, res, next){

            if(!req.active_application){
                return next();
            }
            //People using the core app shouldn't need this as it has direct access
            if(req.active_application.level != 'SUPER' || req.active_application.namespace == app.njax.config.core_app){
                return next();
            }
            var event = req.body.event;

            if(!req.body.users){
                return next(new Error("You need to submit a list of users to broadcast to"));
            }
           var email = null;
           var users = [];
            async.eachSeries(
                req.body.users,
                function(user, cb){

                    if(_.isObject(user) && user._id){
                        var user = user._id;
                    }
                    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
                    var emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                    if(checkForHexRegExp.test(user)){
                        var query = {
                            $or:[
                                { _id: new app.mongoose.Types.ObjectId(user) },
                                { _id: user }
                            ]
                        };

                    }else if(_.isString(user) && emailRe.test(user)) {
                        email = user;
                        var query =  { email:email }

                    }if(_.isString(user) && user.length > 1){
                        var query = { namespace:user }
                    }
                    if(!query){
                        return next(new Error("Cannot identify user" + user))
                    }

                    return app.model.Account.findOne(query).exec(function(err, account){
                        if(err) return next(err);

                        if(account){
                            users.push(account);

                        }else{
                            if(!email){
                                return next(new Error("Cannot identify user: " + user));
                            }
                            users.push(email);
                        }
                        return cb();
                    });


                },
                function(errs){

                    app.njax.broadcast(
                        users,
                        event,
                        req.body.data,
                        req.active_application.namespace
                    );
                    return res.json({ message: 'Job qued up' });//TODO: Insert Event ID Here
                }
            )


       });
 }