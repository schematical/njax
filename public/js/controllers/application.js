'use strict';

/* Controllers */

angular.module('njax.application.controller', [])
    .controller(
        'ApplicationEditFormCtl',
        [
            '$scope',
            'ApplicationService',
			'NJaxBootstrap',
            function($scope, ApplicationService, NJaxBootstrap) {
				$scope.is_admin = NJaxBootstrap.is_admin;
				$scope.app_url = NJaxBootstrap.core_www_url + '/apps';

				if( NJaxBootstrap.application){
					$scope.application = new ApplicationService(NJaxBootstrap.application);
					$scope.bootstrap_data_json = JSON.stringify($scope.application.bootstrap_data);
				}else{
					$scope.application = new ApplicationService({});
				}
				if($scope.application && !$scope.application.desc){
					$scope.application.desc = $scope.application.desc_raw;
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
						document.location = '//' + $scope.application.url;
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
