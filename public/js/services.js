
/**
 This will build the assets from njax_config.js into working angular files
 */
//TODO: Move this to NJax-UTIL in Bower
var njaxServices = angular.module('njax', ['ngTable']);
njaxServices.run(['$http', function($http){
	$http.defaults.headers.common.access_token = window.njax_bootstrap.access_token;

}])
njaxServices.factory('NJaxSocket', ['$q', 'NJaxBootstrap', function ($q, NJaxBootstrap) {
	var socket = io( NJaxBootstrap.www_url);

	var NJaxSocket = {
		_requests: {},
		_subscriptions: {},
		init: function () {


		},
		$query: function (model_name, query, page) {
			return NJaxSocket.$request('$query', {
				model: model_name,
				query: query,
				page: page
			});
		},
		$save: function (model_name, model_data) {

			return NJaxSocket.$request('$save', {
				model: model_name,
				data: model_data
			});
		},
		$archive: function (model_name, model_id) {

			return NJaxSocket.$request('$archive', {
				model: model_name,
				data: {_id: model_id}
			});
		},
		$connect: function (uri, callback) {
			//NOTE WE COULD TEST IF THE FIRST PARAM IS AN OBJECT
			//If it is a string assume it is a uri.
			// If it is an object then its a more specific query
			NJaxSocket._subscriptions[uri] = callback;
			return NJaxSocket.$request('$connect', {
				uri: uri
				/*model:model_name,
				 id:id*/
			});
		},
		$request: function (event, data) {
			var request_id = new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
			var deferred = $q.defer();
			data._event = event;
			NJaxSocket._requests[request_id] = deferred;
			data._request_id = request_id;
			socket.emit(event, data);
			return deferred.promise;
		},
		onResponse: function (data) {
			if (!data._request_id) {
				throw new Error("No request_id in response body");
			}
			if (!NJaxSocket._requests[data._request_id]) {
				throw new Error("No promise matching request_id:" + data._request_id);
			}
			NJaxSocket._requests[data._request_id].resolve(data);
			delete(NJaxSocket._requests[data._request_id]);
		},
		onEvent: function (data) {

			for (var key in NJaxSocket._subscriptions) {
				if (data.entity_uri.substr(0, key.length) == key) {
					NJaxSocket._subscriptions[key](data);
				}
			}

		},
		util: {
			/*serialize:function(obj, prefix) {
			 var str = [];
			 for(var p in obj) {
			 if (obj.hasOwnProperty(p)) {
			 var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
			 str.push(typeof v == "object" ?
			 serialize(v, k) ://THIS SERIALIZE
			 encodeURIComponent(k) + "=" + encodeURIComponent(v));
			 }
			 }
			 return str.join("&");
			 },
			 deserialize:function(str){
			 var obj = {};
			 var parts = str.split("&");
			 for(var i in parts){
			 var part = parts[i];
			 var _parts = part.split("=");
			 var key = decodeURIComponent(_parts[0]);

			 var value = decodeURIComponent(_parts[1]);
			 obj[key] = [value];
			 }
			 return obj;
			 }*/
			parseKeyValue: function (/**string*/keyValue) {
				var obj = {};
				forEach((keyValue || "").split('&'), function (keyValue) {
					var splitPoint, key, val;
					if (keyValue) {
						key = keyValue = keyValue.replace(/\+/g, '%20');
						splitPoint = keyValue.indexOf('=');
						if (splitPoint !== -1) {
							key = keyValue.substring(0, splitPoint);
							val = keyValue.substring(splitPoint + 1);
						}
						key = decodeURIComponent(key);
						if (isDefined(key)) {
							val = isDefined(val) ? decodeURIComponent(val) : true;
							if (!hasOwnProperty.call(obj, key)) {
								obj[key] = val;
							} else if (isArray(obj[key])) {
								obj[key].push(val);
							} else {
								obj[key] = [obj[key], val];
							}
						}
					}
				});
				return obj;
			},

			toKeyValue: function (obj) {
				function encodeUriQuery(val, pctEncodeSpaces) {
					return encodeURIComponent(val).
						replace(/%40/gi, '@').
						replace(/%3A/gi, ':').
						replace(/%24/g, '$').
						replace(/%2C/gi, ',').
						replace(/%3B/gi, ';').
						replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
				}

				var parts = [];
				forEach(obj, function (value, key) {
					if (isArray(value)) {
						forEach(value, function (arrayValue) {
							parts.push(encodeUriQuery(key, true) +
							(arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
						});
					} else {
						parts.push(encodeUriQuery(key, true) +
						(value === true ? '' : '=' + encodeUriQuery(value, true)));
					}
				});
				return parts.length ? parts.join('&') : '';
			}
		}
	}


	socket.on('greeting', function (data) {
		//Emit credentials

		socket.emit('update_credentials', {
			//What are the credentials
			access_token: NJaxBootstrap.access_token
		})
	})
	socket.on('response', NJaxSocket.onResponse);
	socket.on('event', NJaxSocket.onEvent);


	return NJaxSocket;
}])
	.constant('getNamespace', function (str) {
		if(!str){
			return str;
		}
		var namespace = str;
		namespace = namespace.toLowerCase();
		namespace = namespace.replace(/[^\w\s]/gi, '');
		namespace = namespace.replace(/ /g,"-");
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
			query:function(query, search_scopes){
				_njaxSearchable._latestQuery = query;
				if(typeof(search_scopes) == 'Function' || !search_scopes){
					search_scopes = Object.keys(_njaxSearchable._searchable);
				}

				if(!angular.isArray(search_scopes)){
					//throw new Error("Invalid scope");
					//Just going to use all for now
					search_scopes = Object.keys(_njaxSearchable._searchable);
				}
				var promises = [];
				angular.forEach(search_scopes, function(search_scope, index){
					if(!_njaxSearchable._searchable[search_scope]){
						throw new Error("Invalid search scope'" + search_scope + "'");
					}
					promises.push(_njaxSearchable._searchable[search_scope](query));
				});
				return (function(_query){

					return $q.all(promises).then(function(res){

						if(
							(_query != _njaxSearchable._latestQuery) &&
							_njaxSearchable._lastResults
						){
							console.log(_query + '!=' + _njaxSearchable._latestQuery)
							//We are to late so dip out
							return _njaxSearchable._lastResults;
						}

						var results = [];
						for(var i in res){
							for(var ii = 0; ii < res[i].length; ii++){
								results.push(res[i][ii]);
							}
						}
						/*console.log(results);*/
						_njaxSearchable._lastResults = results;
						return results;
					});
				})(query);



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
