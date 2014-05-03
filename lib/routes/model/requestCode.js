var path = require('path');
var fs = require('fs');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = function(app, uri){
    if(!uri) uri = '/requestCodes';
    app.locals.partials._requestcode_edit_form = 'model/_requestcode_edit_form';
    app.param('requestcode', populate)

    app.get(uri, render_list);
    app.get(uri + '/new', render_edit);

    app.get(uri + '/:requestcode', render_detail);
    app.get(uri + '/:requestcode/edit',render_edit);

    app.post(
        uri,
        [
            
            create
        ]
    );
    app.post(
        uri + '/new',
        [
            
            create
        ]
    );
    app.post(
        uri + '/:requestcode',
        [
            
            update
        ]
    );


    function populate(req, res, next, id){
        var or_condition = []


        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
        if(checkForHexRegExp.test(id)){
            or_condition.push({ _id:new ObjectId(id) });
        }
        
        if(or_condition.length == 0){
            return next();
        }
        var query = { $or: or_condition };
        app.model.RequestCode.findOne(query, function(err, requestcode){
            if(err){
                return next(err);
            }

            res.bootstrap('requestcode', requestcode);
            return next();
        })
    }

    function render_list(req, res, next){
        app.model.RequestCode.find({}, function(err, requestCode){
            if(err) return next(err);
            res.locals.requestCode = requestCode;
            res.render('model/requestcode_list');
        });
    }
    function render_detail(req, res, next){
        if(!req.requestcode){
            return next();
        }
        res.render('model/requestcode_detail');
    }
    function render_edit(req, res, next){
        async.series([
            function(cb){
                if(!req.requestcode){
                    //return next();
                    req.requestcode = new app.model.RequestCode();
                }
                return cb();
            },
            
            function(cb){
                if(req.application){
                    return cb();
                }
                app.model.Application.find({ }, function(err, applications){
                    if(err) return next(err);
                    var application_objs = [];
                    for(var i in applications){
                        var application_obj = applications[i].toObject();
                        application_obj._selected = (req.requestCode.application == applications[i]._id);
                        application_objs.push(application_obj);
                    }
                    res.bootstrap('applications', application_objs);
                    return cb();
                });
            },
            
            function(cb){

                res.render('model/requestcode_edit');
            }
        ]);
    }
    function create(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.requestcode){
            req.requestcode = new app.model.RequestCode({
                
                        application:(req.application || null),
                
                cre_date:new Date()
            });
        }
        return update(req, res, next);

    }

    function update(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.requestcode){
            return next(new Error('RequestCode not found'));
        }

        
            
                req.requestcode.code = req.body.code;
            
        
            
                if(req.application){
                    req.requestcode.application = req.application._id;
                }else if(req.body.application){
                    req.requestcode.application = req.body.application;
                }
            
        

        req.requestcode.save(function(err, requestcode){
            //app._refresh_locals();
            res.render('model/requestcode_detail', { requestcode: req.requestcode.toObject() });
        });

    }

}