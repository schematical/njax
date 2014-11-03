/**
 * This module is validate cross site schenanigans
 * @param app
 */
module.exports = function(app){
	/**
	 * This only gets hit when there is NOT a valid origin
	 * @param options
	 * @returns {Function}
	 */
	app.njax.routes.origin_middleware = function(req, res, next){



		//Right now were super friendly but you can bootstrap stuff or overwrite stuff
		return next(new Error("NJax Error: This Origin is not allowed by 'Access-Control-Allow-Origin'"));
	}
}