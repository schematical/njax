var eventServices = angular.module('core100.event.service', ['ngResource']);
/*eventServices.factory(
    'SubscriptionService',
    [
        '$resource',
        function($resource){
            return $resource('/:account/events/:event_id',
            	{
					'account':'@account',
            		'event_id':'@_id'
            	},
            	{
					query: {
						method:'GET',
						params:{

						},
						isArray:true
					}
            	}
            );
        }
    ]
);*/
eventServices.factory(
	'EventService',
	[
		'$http',
		'NJaxBootstrap',
		function($http, NJaxBootstrap){
			return {
				//url:NJaxBootstrap.core_api_url  + '/:account/events/:event_id'
				queryEntity:function(target, type){
					if(!target.api_url){
						throw new Error("Invalid Target passed in");
					}
					var url = NJaxBootstrap.core_api_url + '/events';
					url += '?entity_url=' + target.api_url;
					if(type){
						url += '&type=' + scope.type;
					}

					return $http.get(url);

				},
				/*queryByAccount:function(account, type){
					if(!account.api_url){
						throw new Error("Invalid Account passed in");
					}
					var url = '//' + account.api_url  + '/events';
					if(type){
						url += '&type=' + scope.type;
					}

					return $http.get(url);
				},*/
				add:function(target,type, user){
					if(user){
						throw new Error("We have not buit this")
					}
					return $http.post(
						'//' + target.api_url + '/events',
						{
							type: type
						});
				},
				remove:function(target, type, user){
					if(user){
						throw new Error("We have not buit this")
					}
					if(target._njax_type == 'Subscription'){
						return $http.delete(
							/*'//' +*/ NJaxBootstrap.core_api_url + '/events/' + target._id
						);
					}
					console.error('target:', target);
					throw new Error("Invalid Target to delete");
				}

			};
		}
	]
);

