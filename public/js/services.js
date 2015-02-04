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
					//var $injector = angular.element(document).injector(services);//(services);
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
					console.log(e);
					console.log("Skipped loading:" + module);
				}
			}
		}
	})
	.service('NJaxSearch', ['$q', function($q){
		var _njaxSearchable = {
			_searchable:{},
			register:function(key, search_funct){
				if(typeof(search_funct) != 'function'){
					throw new Error("Invalid Seaarch function");
				}
				_njaxSearchable._searchable[key] = search_funct;
			},
			query:function(query, search_scopes, callback){
				if(typeof(search_scope) == 'Function'){
					callback = search_scopes;
					scope = Object.keys(_njaxSearchable._searchable);
				}

				if(!angular.isArray(search_scopes)){
					return callback(new Error("Invalid scope"));
				}
				var promises = [];
				angular.forEach(search_scopes, function(search_scope, index){
					if(!_njaxSearchable._searchable[search_scope]){
						throw new Error("Invalid search scope'" + search_scope + "'");
					}
					promises.push(_njaxSearchable._searchable[search_scope](query));
				});
				return $q.all(promises).then(function(res){
					//Combine the res
					var results = [];
					for(var i in res){
						for(var ii = 0; ii < res[i].length; ii++){
							results.push(res[i][ii]);
						}
					}
					/*console.log(results);*/
					return results;
				});



			}
		}


		return _njaxSearchable;


	}]);
	/*.service('NJaxHandlebars', function(){

		if(!Handlebars){
			throw new Error("Must have handelbars included");
		}
		//Iterate through the templates passed in

		//Compile them

		//Stuff them in the NJaxHangelbars


	});*/
