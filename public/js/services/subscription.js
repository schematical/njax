var subscriptionServices = angular.module('core100.subscription.service', ['ngResource']);
subscriptionServices.factory(
    'SubscriptionService',
    [
        '$resource',
        function($resource){
            return $resource('/:account/subscriptions/:subscription_id',
            	{
					'account':'@account',
            		'subscription_id':'@_id'
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
);

