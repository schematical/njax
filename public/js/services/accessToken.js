var accessTokenServices = angular.module('core100.accessToken.service', ['ngResource']);
accessTokenServices.factory(
    'AccessTokenService',
    [
        '$resource',
        function($resource){
            return $resource('/access_tokens/:accessToken_id',
            	{
            		'accessToken_id':'@_id'
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

