
/*
 * GET home page.
 */

module.exports = function(app){
	require('./middleware')(app);

	require('./origin_middleware')(app);

    require('./auth')(app);

    require('./admin/index')(app);

    require('./util')(app);

    require('./settings')(app);

    require('./trigger')(app);

	require('./search')(app);


}

