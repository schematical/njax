
angular.module('njax.directives', ['njax.services'])
    .directive('njaxIframe', [ function() {
        return {
            replace:true,
            scope:{
                //xtarget:'='
            },
            link:function(scope, element, attrs) {
                setTimeout(function(){
                    setInterval( function(){
                        var childHeight = element[0].contentWindow.document.body.offsetHeight;
                        element.css('height', childHeight);
                    }, 1000);
                    var jBody = $(element[0].contentWindow.document.body);
                    jBody.find('#njax-payload').val(JSON.stringify(window.njax_bootstrap));
                    jBody.find('#njax-iframe-form').submit();
                }, 1000);
            }

        };
    }])
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
                    namespace = namespace.replace(/ /g,"_");
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

				console.log($scope.tag_options);

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
					$scope.event_tpl = NJaxBootstrap.core_www_url + '/templates/' + NJaxBootstrap._event_tpls[$scope._event.event_namespace] + '.hjs';
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
	.directive('njaxWidget', ['$compile', '$sce', 'NJaxBootstrap', 'NJaxServices',  function($compile, $sce, NJaxBootstrap, NJaxServices) {

		return {
			replace:true,
			scope:{
				'widget':'=njaxWidget'
			},
			//templateUrl: NJaxBootstrap.core_www_url + '/templates/directives/njaxWidget.html',
			link: function($scope, element, attributes) {
				console.log($scope.widget);
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
							.replace(/([a-z\d])([A-Z])/g, '$1-$2');

					NJaxServices.loadFeature(
						$scope.widget.angular_modules,
						function($injector){
							var html = '<div ' + directiveDash + '>AAAA</div>';
							var safe_html = $sce.trustAsHtml(html);
							element.append($compile(html)($scope));
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
					console.log('target_url', target_url);
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
						console.log("Archived:" + target_url);

					});
				});

			}
		};
	}])

