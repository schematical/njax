var _ = require('underscore');
module.exports = function(app){

    function add_partial(key, location){
        res.locals.partials = _.extend(app.locals.partials, res.locals.partials);
        res.locals.partials[key] = location;
    }

    function middleware(req, res, next){
        req.add_partial = _.bind(add_partial, req);


        return next();
    }










    return middleware;






}
