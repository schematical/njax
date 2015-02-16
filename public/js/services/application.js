var applicationServices = angular.module('core100.application.service', ['ngResource']);
applicationServices.factory(
    'ApplicationService',
    [
        '$resource',
		'NJaxBootstrap',
        function($resource, NJaxBootstrap){
            return $resource(NJaxBootstrap.core_api_url + '/apps/:application_id',
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

