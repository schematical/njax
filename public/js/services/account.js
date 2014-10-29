var accountServices = angular.module('core100.account.service', ['ngResource']);
accountServices.factory(
	'AccountService',
	[
		'$resource',
		'NJaxBootstrap',
		function($resource, NJaxBootstrap){
			return $resource(
				NJaxBootstrap.core_api_url + '/:account_id',
				{
					'account_id':'@_id'
				},
				{
				query: {
					method:'GET',
					params:{

					},
					isArray:true
				},
				namespace_available:{
					url:NJaxBootstrap.core_api_url + '/auth/namespace_available',
					method:'GET'
				},
				register:{
					url:NJaxBootstrap.core_api_url + '/register',
					method:'POST'
				}
			});
		}
	]
);

