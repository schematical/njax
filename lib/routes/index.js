
/*
 * GET home page.
 */

module.exports = function(app){



    require('./admin/index')(app);

    require('./util')(app);

    require('./iframe')(app);


}

