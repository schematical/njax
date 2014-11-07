'use strict';

/* Controllers */

angular.module('njax.auth.controller', [])
    .controller(
        'RegisterFormCtl',
        [
            '$scope',
			'$q',
            'AccountService',
			'NJaxBootstrap',
            function($scope, $q, AccountService, NJaxBootstrap) {

                $scope.validate = function(){
					$scope.error = null;
					var deferred = $q.defer();
					if(!$scope.password || $scope.password.length < 8){
						deferred.reject(new Error("Password length is not valid"));
					}else if($scope.password != $scope.password_confirm){
						deferred.reject(new Error("Passwords do not match"));
					}else if(!$scope.name){
						deferred.reject(new Error("Please enter a name"));
					}else if(!$scope.namespace || $scope.namespace.length < 4){
						deferred.reject(new Error("Please enter a username"));
					}else{

						AccountService.namespace_available({ namespace: $scope.namespace }).$promise.then( function(data){
							if(!data.result){
								return deferred.reject(new Error("This username has already been taken"));
							}
							return deferred.resolve(true);
						});
					}
					return deferred.promise;
                }
                $scope.register = function($event){
					$event.preventDefault();
					$scope.validate().then(function(result){
						AccountService.register({
							name:$scope.name,
							username:$scope.email,
							namespace:$scope.namespace,
							password:$scope.password,
							password_confirm:$scope.password_confirm
						}).$promise.then(function(data){
							if(!data){
								return $scope.error = new Error("An unknown error occurred");
							}
							if(data.error){
								return $scope.error = data.error;
							}
							if(data.access_token){
								var d = new Date();
								d.setTime(d.getTime() + (90*24*60*60*1000));
								var expires = "expires="+d.toUTCString();
								document.cookie ="access_token=" + data.access_token + "; " + expires + ";domain="+ NJaxBootstrap.cookie.domain +";path=/";
							}
							if($scope.onRegisterFinish){
								$scope.onRegisterFinish(data);
							}
							$scope.$emit('njax.register.success', data);


						})
						//$event.target.submit();
					},function(err){

						$scope.error = err;

					})

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


