angular.module('njax.directives', ['njax.services'])
	.directive('njaxApplicationWidget', [
		'NJaxBootstrap',
		function(NJaxBootstrap) {
			return {
				replace:true,
				scope:{
					application:'=njaxApplicationWidget'
				},
				templateUrl: '/njax/templates/directives/njaxApplicationWidget.html',
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
						scope.application.widgets[widget.namespace] = widget;
						scope.application.$save(function(){
							alert("Application updated")
						});
					}
				}

			};
		}
	])