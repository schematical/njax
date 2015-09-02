/**
 This will build the assets from njax_config.js into working angular files
 */
//TODO: Move this to NJax-UTIL in Bower
var njaxServices = angular.module('njax');
njaxServices.factory(
	'NJaxBuilder',
	[

		function(){
			return {
				build: function ( NJaxConfig) {

					var Models = {};


					for (var model_name in NJaxConfig.models) {

						var model = NJaxConfig.models[model_name];

						//njaxServices.factory(model.capitalName, function () {

							var njaxResource = (function () {
								return function (data) {
									this._model = model;
									return this;
								}
							})();
							njaxResource.$query = function (query) {
								console.log("!!!!QUERYING!!!!", query);
							}
							njaxResource.prototype.$save = function () {

							}
							njaxResource.prototype.$archive = function () {

							}
						//	return njaxResource;
						Models[model.capitalName] = njaxResource;
						//});

					}
					return Models;
				}
			}

		}
	]
);
