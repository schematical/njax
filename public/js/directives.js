
angular.module('njax.directives', ['njax.services'])
    .directive('njaxIframe', [
		'NJaxBootstrap',
		function(NJaxBootstrap) {
			return {
				replace:true,
				scope:{
					//xtarget:'='
				},
				link:function(scope, element, attrs) {
					var setup = function(){

						try{
							var jBody = $(element[0].contentWindow.document.body);
							jBody.find('#njax-payload').val(JSON.stringify(NJaxBootstrap.njax_payload));
							var jForm = jBody.find('#njax-iframe-form');
							if(jForm.length == 0){
								console.error("Cannot find #njax-iframe-form waiting for 1000ms");
								return setTimeout(setup, 500);
							}
							jForm.submit();
						}catch(e){
							console.error(e);
							return setTimeout(setup, 500);
						}
						return setInterval( function(){
							try {
								var childHeight = element[0].contentWindow.document.body.offsetHeight;
								element.css('height', childHeight);
							}catch(e){
								console.error(e);
							}
						}, 1000);
					}
					setTimeout(setup, 1000);
				}

			};
    	}
	])
    .directive('njaxNamespace', ['getNamespace', function(getNamespace) {

        return {
            replace:true,
            scope:{
               //xtarget:'='
            },
            link:function(scope, element, attrs) {
                //element.val('test');
                var target = angular.element(document.querySelector( '#' + attrs.njaxNamespace));
				var ngModel = element.attr('ng-model');
				var updateFromTarget = function(event) {
					var namespace = getNamespace(target.val());
					element.val(namespace);

					if(ngModel){
						var statment = ngModel + ' = "' + namespace + '";';

						scope.$parent.$eval(ngModel + ' = "' + namespace + '";');
					}
					scope.$parent.$digest();
				}
				setTimeout(updateFromTarget, 250);

                target.on('keyup', updateFromTarget);
                element.on('keyup', function(event){
                    var namespace = element.val()
                    namespace = namespace.toLowerCase();
                    namespace = namespace.replace(/[^\w\s]/gi, '');
                    namespace = namespace.replace(/ /g,"-");
                    if(element.val() != namespace){
                        element.val(namespace);

                    }
                })
            }
            //template: '/njax/templates/directives/njaxNamespace.html',
            /*controller: function($scope) {
                console.log('Target:', $scope.xtarget, $scope.target);
                //$scope.skills = skills;
                //$scope.selectedSkill = 'Bond';
            }*/

        };
    }]).directive('njaxEditable', [ function() {

        return {
            replace:true,
            scope:{


                //
            },
            templateUrl: '/njax/templates/directives/njaxEditable.html',
            link:function(scope, element, attrs) {
                //element.val('test');
                /*scope.popover = {
                    "title": "Title",
                    "content": "Tacos<br />This is a multiline message!",
                    "html":true,
                    "trigger":"hover"
                };*/
               /* var target = angular.element(document.querySelector( '#' + attrs.njaxNamespace));
                target.on('mouseover', function(event) {
                    var namespace = target.val()
                    namespace = namespace.toLowerCase();
                    namespace = namespace.replace(/[^\w\s]/gi, '');
                    namespace = namespace.replace(/ /g,"_");
                    element.val(namespace);

                });*/
            }
        };
    }]).directive('njaxStatusUpdate', [ 'NJaxBootstrap', 'EventService', function(NJaxBootstrap, EventService) {
		return {
			replace:true,
			scope:{
				'target':'@target',
				'event':'@event',
				'users':'@users'
			},
			templateUrl: '/templates/directives/njaxStatusUpdate.html',
			link:function(scope, element, attrs) {
				scope.save = function($event){
					var data = {};
					data.status = scope.status;
					/*console.log("Status:", scope.status);*/
					if(NJaxBootstrap[scope.target]){

						data[scope.target] = NJaxBootstrap[scope.target];
						data['_url'] = NJaxBootstrap[scope.target].url;
					}else{
						data['_url'] = scope.target;
					}
					var users = NJaxBootstrap.user;
					if(NJaxBootstrap[scope.users]){
						users = NJaxBootstrap[scope.users]
					}
					return EventService.trigger({
						event: scope.event,
						data:data,
						users:users
					}, function(){
						alert("Done");
					})
				}
			}

		};
	}]).directive('njaxTagPicker', [ 'NJaxBootstrap', function(NJaxBootstrap) {

		return {
			replace:true,
			scope:{
				tagOptions:'=tagOptions',
				service:'=service',
				allowCustomTags:'=allowCustomTags'
			},
			templateUrl: '/templates/directives/tagSelect.html',
			link: function($scope, element, attributes) {

				$scope.tag_options = $scope.$eval($scope.tagOptions, NJaxBootstrap);



				$scope.skills = NJaxBootstrap.skills;


			}
		};
	}])
	.directive('njaxNewsfeedEvent', ['NJaxBootstrap',  function(NJaxBootstrap) {

		return {
			replace:true,
			scope:{
				'_event':'=event'
			},
			templateUrl: NJaxBootstrap.core_www_url + '/templates/newsfeed/newsfeedEvent.hjs',
			link: function($scope, element, attributes) {
				$scope.ele_name = attributes.name;
				//var entity = attributes.EventType;
				if(!$scope._event.data){
					return console.error("No event data for ", $scope._event);
				}
				for(var i in $scope._event.data){
					if(i != '_event'){
						$scope[i] = $scope._event.data[i];
					}
				}
				if(!$scope._event.event_namespace){
					console.error("No event namespace found for event : " + $scope._event._njax_type + " - " + $scope._event.name);
				}
				if(!NJaxBootstrap._event_tpls[$scope._event.event_namespace]){
					//console.error("No event namespace found for event :"  + $scope._event.event_namespace);
				}else{
					// $scope.event_tpl = NJaxBootstrap.core_www_url + '/templates/' + NJaxBootstrap._event_tpls[$scope._event.event_namespace] + '.hjs';
					$scope.event_tpl =  NJaxBootstrap.core_www_url + '/templates/' + NJaxBootstrap._event_tpls[$scope._event.event_namespace] + '.hjs';
 				}

			}

		};
	}])
	.directive('njaxArchive', ['$location', '$http', '$compile', 'NJaxBootstrap',  function($location, $http, $compile, NJaxBootstrap) {

		return {
			replace:true,
			scope:{
				target:'=njaxArchive',
				redirect_url:'=njaxRedirectUrl',
				callback:'=njaxCallback'//Can use this to trigger function after
			},
			//templateUrl: '/templates/directives/njaxArchiveButton.html',
			link: function($scope, element, attributes) {
				var target_url = null;
				$scope.target = $scope.target || attributes.njaxArchive;
				if(!$scope.target){
					throw new Error("Invalid Target")
				}
				if(typeof($scope.target) == 'string'){
					var target =  $scope.$eval($scope.target, NJaxBootstrap);
					if(target){
						if(typeof(target) == 'string'){
							target_url = target;
						}else{
							if(!(target.api_url || target.url)){
								throw new Error("NJaxBootstrap Object found not valid. No api_url or url")
							}
							target_url = target.api_url || target.url;
						}

					}else{
						target_url = target;
					}


				}else{
					if(!($scope.target.api_url || $scope.target.url)){
						throw new Error("Invalid Target Option");
					}
					target_url = $scope.target.api_url || $scope.target.url;
				}



				element.on('click', function(e){
					e.preventDefault();
					if(target_url.substr(0, 2) != '//'){
						target_url = '//' + target_url;
					}
					console.log('target_url', target_url);
					return $http.delete(target_url).then(function(result){
						if($scope.callback){
							return $scope.callback(result);
						}
						if($scope.redirect_url){
							document.location = $scope.redirect_url
						}
					});
				});

			}
		};
	}])
	.directive('njaxWidget', [ '$compile', '$sce', 'NJaxBootstrap', 'NJaxServices',  function( $compile, $sce, NJaxBootstrap, NJaxServices) {

		return {
			replace:true,
			scope:{
				'widget':'=njaxWidget'
			},
			//templateUrl: NJaxBootstrap.core_www_url + '/templates/directives/njaxWidget.html',
			link: function($scope, element, attributes) {

				if($scope.widget.angular_ctl){
					NJaxServices.loadFeature(
						$scope.widget.angular_modules,
						$scope.widget.angular_ctl,
						function(Crl, x){

							return Crl($scope);
						}
					);
				}else if($scope.widget.angular_directive){
					var directiveDash =  $scope.widget.angular_directive.replace(/\W+/g, '-')
							.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();

					NJaxServices.loadFeature(
						$scope.widget.angular_modules,
						function($injector){
							$injector.invoke(['$compile',function($_compile){

								var html = '<div ' + directiveDash + '>AAAA</div>';
								//var safe_html = $sce.trustAsHtml(html);
								var compiled = $_compile(html)($scope);
								element.append(compiled);
							}]);
						}
					);
				}

			/*
				for(var i in $scope.widget){
					if(i != '_event'){
						$scope[i] = $scope._event.data[i];
					}
				}*/


			}

		};
	}])
	.directive('njaxHideEvent', ['$location', '$http', '$compile', 'NJaxBootstrap',  function($location, $http, $compile, NJaxBootstrap) {

		return {
			replace:true,
			scope:{
				target:'=njaxHideEvent',
				callback:'=njaxCallback',//Can use this to trigger function after,
				hide_element:'=njaxElement'
			},
			//templateUrl: '/templates/directives/njaxArchiveButton.html',
			link: function($scope, element, attributes) {
				var target_url = null;
				$scope.target = $scope.target || attributes.njaxHideEvent;
				if(!$scope.target){
					throw new Error("Invalid Target")
				}
				if(typeof($scope.target) == 'string'){
					if($scope.target.indexOf('/') != -1){
						target_url = $scope.target;//Its a url
					}else{
						var target =  $scope.$eval($scope.target, NJaxBootstrap);
						if(target){
							if(typeof(target) == 'string'){
								target_url = target;
							}else{
								if(!(target.api_url || target.url)){
									throw new Error("NJaxBootstrap Object found not valid. No api_url or url")
								}
								target_url = target.api_url || target.url;
							}

						}else{
							target_url = $scope.target;
						}
					}


				}else{
					if(!($scope.target.api_url || $scope.target.url)){
						throw new Error("Invalid Target Option");
					}
					target_url = $scope.target.api_url || $scope.target.url;
				}



				return element.on('click', function(e){
					e.preventDefault();
					if(target_url.substr(0, 2) != '//'){
						target_url = '//' + target_url;
					}

					return $http.post(target_url + '/hide').then(function(result){
						if($scope.hide_element){
							var ele = angular.element($scope.hide_element);
							if(ele.length > 0){
								ele.addClass('hidden');
							}
						}
						if($scope.callback){
							return $scope.$parent.$eval($scope.callback, { result:result  });
						}


					});
				});

			}
		};
	}])
	.directive(
		'njaxSubscription',
		[
			'$q',
			'$http',
			'$rootScope',
			'NJaxBootstrap',
			'SubscriptionService',
			function($q, $http, $rootScope, NJaxBootstrap, SubscriptionService) {
				return {
					replace: true,
					scope: {
						'target': '=target',
						'type':'@type',
						'onSubscribe':'@onSubscribe',
						'onUnSubscribe':'@onUnSubscribe',
						'beforeUnSubscribe':"@befureUnSubscribe"
					},
					transclude: true,
					template:'<div ng-transclude> </div>',
					//templateUrl: '/templates/directives/njaxComments.html',
					link: function (scope, element, attrs) {
						scope.loading = true;
						var target = scope.$parent.$eval(scope.target, NJaxBootstrap);
						if(!target){
							target = scope.target;
						}


						scope.addSubscription = function(){
							if(!NJaxBootstrap.user){
								//TODO: Log them in?
								return console.error("Need to be user to subscribe");
							}
							SubscriptionService.add(target).success( function(response){
								scope.subscriptions.push(response);
								scope.count += 1;
								scope.is_subscribed = true;
								//scope.$emit('njax.subscription.create.local', scope.subscription)
								$rootScope.$broadcast('njax.subscription.create.local', response);
								if(scope.onSubscribe){
									scope.onSubscribe(response);
								}

							}).error(function(err){
								throw err;
							})
						}
						scope.promptUnSubscribe = function(){
							if(!scope.beforeUnSubscribe){
								return scope.removeSubscription();
							}
							return scope.beforeUnSubscribe(scope.removeSubscription);
						}
						scope.removeSubscription = function(){
							if(!NJaxBootstrap.user){
								//TODO: Log them in?
								return console.error("Need to be user to subscribe");
							}
							scope.count -= 1;
							var promisses = [];
							for(var i in scope.subscriptions) {
								promisses.push(SubscriptionService.remove(scope.subscriptions[i]).success(function(response){
									$rootScope.$broadcast('njax.subscription.remove.local', response);//scope.subscriptions[i])

									if(scope.onUnSubscribe){
										scope.onUnSubscribe(response);//scope.onUnSubscribe);
									}
									return response;
								}));
								scope.subscriptions.splice(i, 1);
							}

							$q.all(promisses).then( function(response){


								scope.posting = false;

								scope.is_subscribed = false;


							})/*.error(function(err){
								throw err;
							})*/
						}

						SubscriptionService.queryEntity(scope.target, scope.type).success( function(subscriptions){


							scope.loading = false;

							scope.count = subscriptions.length;
							scope.is_subscribed = scope.count > 0;
							scope.subscriptions = subscriptions;






							scope.onClick = function(e){
								e.preventDefault();

								if(scope.is_subscribed){
									scope.promptUnSubscribe();
								}else{
									scope.addSubscription();
								}

							}

							element.on('click', scope.onClick);


						}).error(function(err){
							throw err;
						})



					}

				}
			}
		]
	)
	.directive('njaxComments', ['$http', '$rootScope', 'NJaxBootstrap', function($http, $rootScope, NJaxBootstrap) {
		return {
			replace:true,
			scope:{
				'target':'@target',
				'bootstrap':'@bootstrap',
				'event':'@event',
				'sanitizeData':'@njaxSanitizeData',
				'preloadComments':'=preloadComments',
				'commentEventName':'@commentEventName',
				'expanded':'=?expanded'
			},
			templateUrl: (NJaxBootstrap.core_asset_url || NJaxBootstrap.core_www_url) + '/templates/directives/njaxComments.html',
			link:function(scope, element, attrs) {
				scope.posting = false;
				scope.hidden = !scope.expanded;
				scope.loading = false;
				if(!scope.event){
					scope.event = 'comment.create';
				}
				var target = scope.$parent.$eval(scope.target, NJaxBootstrap);
				if(!target){
					target = scope.target;
				}
				scope.toggleDisplay = function(){
					scope.hidden = false;
					if(scope.comments){

						return;
					}
					scope.loadComments();

				}
				scope.loadComments = function(){
					scope.loading = true;
					$http.get('//' + target.api_url + '/events').success(function(events){
						scope.comments = [];
						for(var i in events){
							if(events[i].event_namespace.substr(events[i].event_namespace.length - '.comment.create'.length) == '.comment.create'){
								var data = events[i].data;
								data._event = events[i];
								scope.comments.push(data);
							}
						}
						scope.loading = false;

					});
				}



				var users = []
				var creator = null;
				if(target.owner){
					creator = target.owner._id || target.owner;
				}else if(target.data.owner){
					creator = target.data.owner._id || target.data.owner;
				}else if(target.user){
					creator = target.user._id;
				}else if (target.data.user){
					creator = target.data.user._id;
				}

				if(creator){
					users.push(creator);
				}
				for(var i in scope.comments){
					if(scope.comments[i].user){
						users.push(scope.comments[i].user._id || scope.comments[i].user)
					}else if(scope.comments[i].data.user){
						users.push(scope.comments[i].data.user._id || scope.comments[i].data.user)
					}
				}
				scope.save = function($event){
					var data = {
						body: scope.body,
					};
					scope.posting = true;

					if(typeof(target) != 'string'){

						data['target'] = target;
						data['_url'] = target.url;
					}else{
						data['_url'] = target;

					}
					data['user'] = NJaxBootstrap.user;
					var comment_data = {
						_id: target._id || null,
						users: users,
						//body: scope.body,
						//This other stuff really doesnt matter
						event_namespace: scope.event,
						event: scope.event,
						data: data
					}
					if(scope.sanitizeData){
						var t_comment_data = scope.$parent.$eval(scope.sanitizeData, {
							comment_data:comment_data
						})
						if(!t_comment_data){
							//THIS IS A SAD HACK
							t_comment_data = $rootScope.$eval(scope.sanitizeData, {
								comment_data:comment_data
							})
							if(!t_comment_data){
								throw new Error("Invalid njaxSanitizeData function. Must return comment_data");
							}
						}
						comment_data = t_comment_data;
					}

					return $http.post( NJaxBootstrap.core_api_url + '/trigger', comment_data).success( function(response){

						scope.status = '';
						scope.posting = false;
						scope.comments = [comment_data.data].concat(scope.comments);
						scope.body = '';
						scope.$emit('njax.comment.create.local', comment_data)

					}).error(function(err){
						throw err;
					})
				}
				if(!scope.commentEventName){
					scope.commentEventName = (NJaxBootstrap.active_application && NJaxBootstrap.active_application.namespace) || 'njax';
				}
				$rootScope.$on(scope.commentEventName + '.comment.create', function(event, data){
					if(data._url == (target._url || target)){
						scope.comments.push(data);
					}
				});
				if(scope.preloadComments){
					scope.loadComments();
				}

			}

		};
	}]).directive('njaxSearchBox', ['$timeout', '$q', 'NJaxBootstrap', 'NJaxSearch', function($timeout, $q, NJaxBootstrap, NJaxSearch) {
		return {
			replace:true,
			scope:{
				'search_scope_desc':'@searchScopeDesc',
				'search_scope':'@searchScope',
				'triggerSearchSelected':'&searchSelected',
				'triggerSearchChange':'&searchChange',
				'event':'@event'
			},
			templateUrl: NJaxBootstrap.core_www_url +  '/templates/directives/njaxSearchBox.html',
			link:function(scope, element, attrs) {
				if(scope.search_scope){
					scope.search_scopes = scope.search_scope.split(',')
				}else{
					scope.search_scope_desc = 'all';
				}
				scope.search = function($viewValue){
					return NJaxSearch.query($viewValue, scope.search_scopes).then(function(results){

						scope.results = results;
						if(typeof(scope.query) === 'string') {
							if (scope.triggerSearchChange) {
								scope.triggerSearchChange({
									query: scope.query,
									results: results
								});
							}
						}
						return results;
					});



				}
				scope.selectEntity = function(){
					if(typeof(scope.query) !== 'string'){
						if(scope.triggerSearchSelected){
							return scope.triggerSearchSelected({ entity:scope.query, runDefault:scope.selectEntity_default });
						}else{
							return scope.selectEntity_default();
						}
					}
				}
				scope.selectEntity_default = function(){

					return document.location = 'http://' + (scope.query.location_friendly_url ||scope.query.url);
				}
				scope.setSearchScope = function(search_scopes, search_scope_desc){
					scope.search_scopes = search_scopes;
					scope.search_scope_desc = search_scope_desc;
				}
			}

		};
	}])
	.directive('njaxSearchResult', ['NJaxBootstrap',  function(NJaxBootstrap) {

		return {
			replace:true,
			scope:{
				'_result':'=njaxSearchResult'
			},
			templateUrl: NJaxBootstrap.core_www_url + '/templates/browse/searchResult.hjs',
			link: function($scope, element, attributes) {
				$scope.ele_name = attributes.name;

				if(!$scope._result){
					return console.error("No result data for ", $scope._result);
				}
				$scope.entity = {};
				for(var i in $scope._result){
					//if(i != '_event'){
						$scope.entity[i] = $scope._result[i];
					//}
				}
				if(!$scope._result._njax_type){
					console.error("No event namespace found for event : " + $scope._result._njax_type + " - " + $scope._result.name);
				}
				if(!NJaxBootstrap._search_tpls[$scope._result._njax_type]){
					//console.error("No event namespace found for event :"  + $scope._event.event_namespace);
				}else{
					// $scope.event_tpl = NJaxBootstrap.core_www_url + '/templates/' + NJaxBootstrap._event_tpls[$scope._event.event_namespace] + '.hjs';
					$scope.event_tpl = '/templates/' + NJaxBootstrap._search_tpls[$scope._result._njax_type] + '.hjs';
				}

			}

		};
	}])
	.directive(
	'njaxSubscriptionCount', [
		'$http',
		'$rootScope',
		'NJaxBootstrap',
		'SubscriptionService',
		function($http, $rootScope, NJaxBootstrap, SubscriptionService) {
			return {
				replace: true,
				scope: {
					'target': '=target',
					'type':'@type'
				},
				//templateUrl: '/templates/directives/njaxComments.html',
				link: function (scope, element, attrs) {

					SubscriptionService.queryEntity(scope.target, scope.type).success( function(response){


						scope.posting = false;

						scope.count = response.length;
						var jElement = angular.element(element[0]);
						jElement.html(scope.count);

					}).error(function(err){
						throw err;
					})

				}
			}
		}
	])
	.directive(
		'njaxEventsList',
		[
			'$http',
			'$rootScope',
			'NJaxBootstrap',
			'EventService',
			function($http, $rootScope, NJaxBootstrap, EventService) {
				return {
					replace: true,
					scope: {
						'target': '=?target',
						'events': '=?events',
						'limit':'=?limit',
						'type':'@type'
					},
					templateUrl: '/templates/directives/njaxEventsList.html',
					link: function (scope, element, attrs) {

						EventService.queryEntity(scope.target, scope.type).success( function(response){


							scope.posting = false;

							scope.count = response.length;
							var jElement = angular.element(element[0]);
							jElement.html(scope.count);

						}).error(function(err){
							throw err;
						})

					}
				}
			}
		]
	)
	.directive(
		'njaxSubscriptionAccountList',
		[
			'$http',
			'$rootScope',
			'NJaxBootstrap',
			'SubscriptionService',
			function($http, $rootScope, NJaxBootstrap, SubscriptionService) {
				return {
					replace: true,
					scope: {
						'target': '=target',
						'type':'@type'
					},
					templateUrl:  (NJaxBootstrap.core_asset_url || NJaxBootstrap.core_www_url) + '/templates/directives/njaxSubscriptionAccountList.html',
					link: function (scope, element, attrs) {

						SubscriptionService.queryEntity(scope.target, scope.type).success( function(response){


							scope.posting = false;

							scope.count = response.length;
							scope.subscriptions = response;

						}).error(function(err){
							throw err;
						})
						$rootScope.$on('njax.subscription.create.local', function(e, subscription){
							scope.subscriptions = [subscription].concat(scope.subscriptions);

						});
						$rootScope.$on('njax.subscription.remove.local', function(e, subscription){
							for(var i in scope.subscriptions){
								if(
									(scope.subscriptions[i].url == subscription.url)
								){
									scope.subscriptions.splice(i, 1);
								}
							}
						});

					}
				}
			}
		]
)
.directive(
	'njaxSubscriptionList',
	[
		'$q',
		'$http',
		'$rootScope',
		'NJaxBootstrap',
		'SubscriptionService',
		function($q, $http, $rootScope, NJaxBootstrap, SubscriptionService) {
			return {
				replace: true,
				scope: {
					'account': '=account',
					'type':'@type',
					'preLoad':'=?',
					'preLoadEntities':'=?'
				},
				templateUrl:  (NJaxBootstrap.core_asset_url || NJaxBootstrap.core_www_url) + '/templates/directives/njaxSubscriptionList.html',
				link: function (scope, element, attrs) {
					scope.load = function() {
						scope.loading = false;
						return SubscriptionService.queryByAccount(scope.account, scope.type).success(function (response) {
							scope.count = response.length;
							var subscriptions = response;
							var promises = [];
							scope.subscriptions = [];
							for (var i in subscriptions) {
								subscriptions[i] =(function(subscription){

									if(scope.preLoadEntities){
										promise =  $http.get('//' + subscription.entity_url).then(function(response){
											return response.data;
										});
										promises.push(promise);
										promise._njax_type = subscription.entity_type;
										promise.name = subscription._entity_name;
										promise.namespace = subscription._entity_namespace;
										promise.api_url = subscription.entity_url;
										promise.url = subscription.entity_url;
									}else{
										subscription._njax_type = subscription.entity_type;
										subscription.name = subscription._entity_name;
										subscription.namespace = subscription._entity_namespace;
										subscription.api_url = subscription.entity_url;
										subscription.url = subscription.entity_url;
										subscription.loadEntity = function(){
											return $http.get('//' + subscription.entity_url);
										}
										scope.subscriptions.push(subscription)
									}

									return subscription;
								})(subscriptions[i]);

							}
							$q.all(promises).then(function(subscriptions){
								console.log(subscriptions);
								scope.subscriptions = subscriptions;
								scope.loading = false;
								if(!$rootScope.$$phase){
									$rootScope.$digest();
								}
							});
							$rootScope.$on('njax.subscription.create.local', function(subscription){
								scope.subscriptions = [subscription].concat(scope.subscriptions);
							});
							$rootScope.$on('njax.subscription.remove.local', function(subscription){
								for(var i in scope.subscriptions){
									if(
										(scope.subscriptions[i].url == subscription.url)
									){
										scope.subscriptions.splice(i, 1);
									}
								}
							});


						}).error(function (err) {
							throw err;
						})
					}
					if(scope.preLoad){
						return scope.load();
					}

				}
			}
		}
	]
)