NJax.Builder.extend(
	'Subscription',
	[
		'$http',
		'NJaxBootstrap',
		'nSubscription',
		function($http, NJaxBootstrap, nSubscription){

			nSubscription.queryEntity = function(target, type){
				if(!target.api_url){
					throw new Error("Invalid Target passed in");
				}
				var url = NJaxBootstrap.core_api_url + '/subscriptions';
				url += '?entity_url=' + target.api_url;
				if(type){
					url += '&type=' + scope.type;
				}

				return $http.get(url);

			};
			nSubscription.queryByAccount = function(account, type){
					if(!account.api_url){
						throw new Error("Invalid Account passed in");
					}
					var url = '//' + account.api_url  + '/subscriptions';
					if(type){
						url += '&type=' + scope.type;
					}

					return $http.get(url);
			};
			nSubscription.add = function(target,type, user){
				if(user){
					throw new Error("We have not buit this")
				}
				return $http.post(
					'//' + target.api_url + '/subscriptions',
					{
						type: type
					});
			};
			nSubscription.remove = function(target, type, user){
				if(user){
					throw new Error("We have not buit this")
				}
				if(target._njax_type == 'Subscription'){
					return $http.delete(
						/*'//' +*/ NJaxBootstrap.core_api_url + '/subscriptions/' + target._id
					);
				}
				console.error('target:', target);
				throw new Error("Invalid Target to delete");
			}
			return nSubscription;

		}
	]
);

