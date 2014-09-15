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
           var users = [];
            async.eachSeries(
                req.body.users,
                function(user, cb){
                    if(_.isObject(user) && user._id){
                        var user = user._id;
                    }
                    if(_.isString(user) && user.length > 1){
                        var query = {
                            $or:[
                                { email:user },
                                { namespace:user }
                            ]
                        }
                        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

                        if(checkForHexRegExp.test(user)){
                            query.$or.push({ _id:new ObjectId(user) });
                        }

                        return app.model.Account.findOne(query).exec(function(err, account){
                            if(err) return next(err);
                            if(!account){
                                return next(new Error("Cannot identify user" + user));
                            }
                            users.push(account);
                            return cb();
                        });
                    }
                    return next(new Error("Cannot identify user" + user))
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