

var njaxBootstrapService = angular.module('njax.bootstrap', []);
njaxBootstrapService.factory(
	'NJaxBootstrap',
	['$http', function($http){
		if(window.njax_bootstrap){
			return window.njax_bootstrap;
		}else{
			console.error("window.njax_bootstrap not found");
		}
	}]
);