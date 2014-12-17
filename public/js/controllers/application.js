'use strict';

/* Controllers */

angular.module('core100.application.controller', [])
    .controller(
        'ApplicationEditFormCtl',
        [
            '$scope',
            'ApplicationService',
			'NJaxBootstrap',
            function($scope, ApplicationService, NJaxBootstrap) {
				if( NJaxBootstrap.application){
					$scope.application = new ApplicationService(NJaxBootstrap.application);
					$scope.bootstrap_data_json = JSON.stringify($scope.application.bootstrap_data);
				}else{
					$scope.application = new ApplicationService({});
				}
				$scope.$watch(function(){
					return JSON.stringify(($scope.application && $scope.application.bootstrap_data) || {});
				}, function(newValue, oldValue){
					$scope.bootstrap_data_json = JSON.stringify(($scope.application && $scope.application.bootstrap_data) || {});
				});
                $scope.validate = function(){


                }
                $scope.save = function($event){

					if($scope.super_options_frm.bootstrap_data_json.$dirty){
						try{
							$scope.application.bootstrap_data = JSON.parse($scope.bootstrap_data_json);
						}catch(e){

							$scope.bootstrap_data_error = e;
							return $event.preventDefault();
						}
					}

					$scope.application.$save(function(){
						alert("Done");
					});
                }
            }
        ]
    )
	.controller(
		'ApplicationDetailCtl',
        [
            '$scope',
            'ApplicationService',
            'NJaxBootstrap',
            function($scope, ApplicationService, NJaxBootstrap) {
				if( NJaxBootstrap.application){
					$scope.application = new ApplicationService(NJaxBootstrap.application);
				}

            }
        ]
    )
    .controller(
        'ApplicationListCtl',
        [
            '$scope',
            'ApplicationService',
            function($scope, ApplicationService) {

                $scope.search = function(){


                }
            }
        ]
    )
