var requestCodeServices = angular.module('core100.requestCode.service', ['ngResource']);
requestCodeServices.factory(
    'RequestCodeService',
    [
        '$resource',
        function($resource){
            return $resource('/request_codes/:requestCode_id',
            	{
            		'requestCode_id':'@_id'
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

