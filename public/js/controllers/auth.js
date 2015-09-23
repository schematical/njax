'use strict';

/* Controllers */

angular.module('njax')/*.auth.controller', [])*/
    .controller(
        'RegisterPageCtl',
        [
            '$scope',

			'NJaxBootstrap',
            function($scope,  NJaxBootstrap) {
				$scope.onRegisterFinish = function(){
					alert("Redirect to new page");
				}

            }
        ]
    )
	.controller(
		'LoginFormCtl',
		[
			'$scope',
			'AccountService',
			function($scope, AccountService) {

				$scope.validate = function(){

				}
				$scope.save = function(){


				}
			}
		]
	)


