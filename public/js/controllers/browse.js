'use strict';

/* Controllers */

angular.module('njax.browse.controller', [])
	.controller(
	'NJaxBrowseCtl',
	[
		'$scope',
		'NJaxBootstrap',
		function($scope, NJaxBootstrap) {
			$scope.searchChange = function(query, results){
				$scope.results = results;
			}

			$scope.searchSelected = function(query, runDefault){
				//TODO: Make this dynamic some day
				if(query.location_friendly_url && query.location_friendly_url.length > 0){
					return document.location = '//' + query.location_friendly_url;
				}
				if(query.url && query.url.length > 0){
					return document.location = '//' + query.url;
				}
				console.error("No url found for this entity");
				//return runDefault();
			}




		}
	]
)
/*.filter('filterSearchResults',[
	'NJaxSearch',
	function(NJaxSearch) {
		return function(input, value) {


			return out;
		};
	}
])*/

