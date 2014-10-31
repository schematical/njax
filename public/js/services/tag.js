var tagServices = angular.module('njax.tag.service', ['ngResource']);
tagServices.factory(
    'TagService',
    [
        '$resource',
        function($resource){
            return $resource('/tags/:tag_id',
            	{
            		'tag_id':'@_id'
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

