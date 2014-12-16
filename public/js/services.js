angular.module('njax.services', [])
	.constant('getNamespace', function (str) {
		var namespace = str;
		namespace = namespace.toLowerCase();
		namespace = namespace.replace(/[^\w\s]/gi, '');
		namespace = namespace.replace(/ /g,"_");
		return namespace;
	})
	.service('NJaxAuth', ['$cookies', 'NJaxBootstrap', 'AccountService', function($cookies, NJaxBootstrap, AccountService){

		return {
			crossdomain:function(){


				/*if ( window.location !== window.parent.location ) {
					return;
				}
				var jBody = angular.element('body')
				var jIFrame = angular.element('<iframe width="1" height="1" ng-src="' + NJaxBootstrap.core_www_url + '/me?redirect_uri='+ document.location + '" frameborder="0"></iframe>');
				jIFrame.load(function(){
					try{
						console.log(jIFrame.contents());
					}catch(e){
					console.error(e);
					}
				});
				jBody.append(jIFrame);*/
				AccountService.me().$promise.then(function(results){
					window.njax_bootstrap.user = results.user;

					if(results.user){

						if(results.user.access_token && !$cookies.access_token){
							$cookies.access_token = window.njax_bootstrap.user.access_token;
						}
					}else{
						if($cookies.access_token){
							$cookies.access_token = null;
						}

					}
				});

			}
		}


	}])
	.service('NJaxServices', function(){
		return {
			loadFeature:function(services, module, callback){
				try{
					var $injector = angular.injector(services);
					if(!callback && typeof(module) == 'function'){
						callback = module;
						module = null;
						return callback($injector);
					}else{
						$injector.invoke([module,callback]);
					}
				}catch(e){
					//throw e;
					console.log("Skipped loading:" + module);
				}
			}
		}
	});
	/*.service('NJaxHandlebars', function(){

		if(!Handlebars){
			throw new Error("Must have handelbars included");
		}
		//Iterate through the templates passed in

		//Compile them

		//Stuff them in the NJaxHangelbars


	});*/
