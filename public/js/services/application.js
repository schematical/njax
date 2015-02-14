var applicationServices = angular.module('core100.application.service', ['ngResource']);
applicationServices.factory(
    'ApplicationService',
    [
        '$resource',
        function($resource){
            return $resource('/apps/:application_id',
            	{
            		'application_id':'@_id'
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

