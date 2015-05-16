angular.module('njax.directives'/*, ['njax.services']*/)
	.directive('njaxApplicationWidget', [
		'NJaxBootstrap',
		'ApplicationService',
		function(NJaxBootstrap, ApplicationService) {
			return {
				replace:true,
				scope:{
					application:'=njaxApplicationWidget'
				},
				templateUrl: '/templates/directives/njaxApplicationWidget.html',
				link:function(scope, element, attrs) {
					if(!scope.application){
						scope.application =  new ApplicationService(NJaxBootstrap.application);
					}
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
		'ApplicationService',
		function(NJaxBootstrap, ApplicationService) {
			return {
				replace:true,
				scope:{
					application:'=njaxApplicationIframe'
				},
				templateUrl: '/templates/directives/njaxApplicationIframe.html',
				link:function(scope, element, attrs) {
					if(!scope.application){
						scope.application = new ApplicationService(NJaxBootstrap.application);
					}
					scope.iframe_options = NJaxBootstrap.iframes;
					scope.action_options = [
						{
							namespace:'tab',
							name:"Open as a tab"
						},
						{
							namespace:'external_link',
							name:"Link out to new page"
						},
						{
							namespace:'relative_link',
							name:"Link to a page relitve to this page"
						},
						{
							namespace:'application_link',
							name:"Link to a page relitve to this application"
						}/*,
						{
							namespace:'window',
							name:"Link out as a new window"
						}*/
					]

					scope.iframes = scope.application.iframes || [];
					for(var i in scope.iframes){
						if(scope.application && scope.application.iframes && scope.application.iframes[scope.iframes[i].namespace]){
							scope.iframes[i].url = scope.application.iframes[scope.iframes[i].namespace].url
							scope.iframes[i]._orig_namespace = scope.iframes[i].namespace;

							for(var ii in scope.iframe_options){
								if(scope.iframe_options[ii].namespace == scope.iframes[i].iframe_type){
									scope.iframes[i]._iframe_type_desc = scope.iframe_options[ii].name;
								}
							}
						}
					}

					scope.addNewIframe = function(){
						scope.selected_iframe = {
							weight: 50,
							action:'tab'
						};
					}
					scope.saveIframe= function(iframe, $event){
						$event.preventDefault();
						if(!scope.application.iframes){
							scope.application.iframes = {};
						}
						iframe.namespace = iframe.iframe_type + '-' + iframe.short_namespace;
						if(iframe._orig_namespace != iframe.namespace) {
							delete(scope.application.iframes[iframe._orig_namespace]);
						}
						scope.application.iframes[iframe.namespace] = iframe;

						scope.application.$save(function(err){
							alert("Saved");
						});
					}
					scope.selectIframe = function(iframe, $event){
						$event.preventDefault();
						scope.selected_iframe = iframe;
					}
					scope.deleteIframe = function(iframe, $event){
						$event.preventDefault();
						delete(scope.application.iframes[iframe.namespace]);
						scope.application.$save(function(err){
							alert("Saved");
						});

					}
					scope.clearAllIframes = function($event){
						$event.preventDefault();
						scope.application.iframes = {};
						scope.application.$save(function(err){
							alert("Saved");
						});

					}

				}

			};
		}
	])