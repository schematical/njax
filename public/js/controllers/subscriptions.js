'use strict';

/* Controllers */

angular.module('njax.subscriptions.controller', [])
	.controller(
	'NJaxSubscriptionsCtl',
	[
		'$scope',
		'NJaxBootstrap',
		function($scope, NJaxBootstrap) {

			$scope.subscriptions = NJaxBootstrap.subscriptions;
			for(var i in $scope.subscriptions){
				$scope.subscriptions[i]._njax_type = $scope.subscriptions[i].entity_type;
				$scope.subscriptions[i].name = $scope.subscriptions[i]._entity_name;
				$scope.subscriptions[i].namespace = $scope.subscriptions[i]._entity_namespace;
				$scope.subscriptions[i].api_url = $scope.subscriptions[i].entity_url;
				$scope.subscriptions[i].url = $scope.subscriptions[i].entity_url;

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

