
angular.module('njax.directives', [])
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
    .directive('njaxNamespace', [ function() {

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
					var namespace = target.val()
					namespace = namespace.toLowerCase();
					namespace = namespace.replace(/[^\w\s]/gi, '');
					namespace = namespace.replace(/ /g,"_");
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
	}]);;
