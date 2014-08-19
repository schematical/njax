
/*
 * GET home page.
 */

module.exports = function(app){
    require('./model/account')(app);

    require('./model/application')(app);

    require('./s3')(app);
}

