angular.module('njax.directives', ['njax.services'])
	.directive('njaxApplicationWidget', [
		'NJaxBootstrap',
		function(NJaxBootstrap) {
			return {
				replace:true,
				scope:{
					application:'=njaxApplicationWidget'
				},
				templateUrl: '/templates/directives/njaxApplicationWidget.html',
				link:function(scope, element, attrs) {

					/*
					weight:10,
					src:[
						application.app_url + '/js/widgets.js',
						application.app_url + '/js/services/opportunity.js'
					],
					angular_directive:'oppertunityListWidget',
					angular_modules:[
						'opp100.widgets'
					],
					active:false
					}*/
					scope.deleteWidget = function(widget, $event){
						$event.preventDefault();
						if(!widget.namespace || !scope.application.widgets[widget.namespace]){
							return alert("There is a problem removing this widget");
						}
						delete(scope.application.widgets[widget.namespace]);
						scope.application.$save(function(err){
							alert("Widget successfully removed");
						})
					}
					scope.addNewWidget = function(){
						scope.selected_widget = {
							weight: 50
						};
					}
					scope.saveWidget = function(widget, $event){
						$event.preventDefault();
						if(!scope.application.widgets){
							scope.application.widgets = {};
						}
						widget.angular_modules = widget.angular_modules_raw.split(',');
						widget.src = widget.asset_urls_raw.split(',');
						scope.application.widgets[widget.namespace] = widget;
						scope.application.$save(function(){
							alert("Application updated")
						});
					}
				}

			};
		}
	])
	.directive('njaxApplicationIframe', [
		'NJaxBootstrap',
		function(NJaxBootstrap) {
			return {
				replace:true,
				scope:{
					application:'=njaxApplicationIframe'
				},
				templateUrl: '/templates/directives/njaxApplicationIframe.html',
				link:function(scope, element, attrs) {

					scope.iframes = NJaxBootstrap.iframes;
					scope.saveIframe= function(widget, $event){
						scope.application.iframes = scope.iframes;
						console.log(scope.application.iframes);
					}

				}

			};
		}
	])