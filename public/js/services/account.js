var accountServices = angular.module('njax.account.service', ['ngResource']);
accountServices.factory(
	'AccountService',
	[
		'$resource',
		'NJaxBootstrap',
		function($resource, NJaxBootstrap){
			return $resource(
				NJaxBootstrap.core_api_url + '/accounts/:account_id',
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
				me:{
					url:NJaxBootstrap.core_api_url + '/me',
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

