/**
 This will build the assets from njax_config.js into working angular files
 */
//TODO: Move this to NJax-UTIL in Bower
var njaxServices = angular.module('njax', ['ngTable']);
njaxServices.factory('NJaxSocket', ['$q', 'NJaxBootstrap', function($q, NJaxBootstrap){
	var socket = io('http://localhost:3030');


	var NJaxSocket = {
		_requests:{},
		_subscriptions:{},
		init:function(){


		},
		$query:function(model_name, query, page){
			return NJaxSocket.$request('$query', {
				model:model_name,
				query:query,
				page:page
			});
		},
		$save:function(model_name, model_data){

			return NJaxSocket.$request('$save', {
				model:model_name,
				data:model_data
			});
		},
		$connect:function(uri, callback){
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
		$request:function(event, data){
			var request_id = new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
			var deferred = $q.defer();
			data._event = event;
			NJaxSocket._requests[request_id] = deferred;
			data._request_id = request_id;
			socket.emit(event, data);
			return deferred.promise;
		},
		onResponse:function(data){
			if(!data._request_id){
				throw new Error("No request_id in response body");
			}
			if(!NJaxSocket._requests[data._request_id]){
				throw new Error("No promise matching request_id:" + data._request_id);
			}
			NJaxSocket._requests[data._request_id].resolve(data);
			delete(NJaxSocket._requests[data._request_id]);
		},
		onEvent:function(data){
			//console.log('OnEvnet Fired', data);
			for(var key in NJaxSocket._subscriptions){
				if(data.entity_uri.substr(0, key.length) == key){
					NJaxSocket._subscriptions[key](data);
				}
			}

		}
	}


	socket.on('greeting', function(data){
		//Emit credentials
		console.log('NJaxBootstrap', NJaxBootstrap);
		socket.emit('update_credentials', {
			//What are the credentials
			access_token:NJaxBootstrap.access_token
		})
	})
	socket.on('response', NJaxSocket.onResponse);
	socket.on('event', NJaxSocket.onEvent);



	return NJaxSocket;
}])


window.NJax = {};
window.NJax.Builder = {
	build:function(njax_config){
		njax_config = njax_config || window.njax_config;
		for (var model_name in njax_config.models) {

			var model = njax_config.models[model_name];
			NJax.Builder.buildResource(NJax, model);
			NJax.Builder.buildDirective(model);
		}
	},
	buildResource:function(NJax, model){

		njaxServices.factory(
			model.capitalName,
			[
				'$q',
				'NJaxSocket',
				function($q, NJaxSocket){
				var njaxResource = (function () {
					return function (data) {
						this._model = model;
						this.data = data || {};
						var _this = this;
						for(var key in model.fields){
							(function(_key) {
								Object.defineProperty(
									_this,
									_key,
									{
										set: function (val) {
											return _this.data[_key] = val;
										},
										get: function () {
											return _this.data[_key];
										}
									}
								);
							})(key);

						}
						return this;
					}
				})();

				njaxResource.$query = function (query) {
					return NJaxSocket.$query(model.capitalName, query, 0);
				}
				njaxResource.prototype.$save = function () {
					var _this = this;
					var deferred = $q.defer();

					NJaxSocket.$save(model.capitalName, this.data).then(function(data){
						_this.data = data.response;
						deferred.resolve(this);
					})
					return deferred.promise;
				}
				njaxResource.prototype.$archive = function () {


				}
				njaxResource.prototype.connect = function () {

					NJaxSocket.$connect(this.uri).then(function(data){
						_this.data = data.response;
						deferred.resolve(this);
					})
				}
				return njaxResource;

			}
		]);


	},
	buildDirective:function(model){

		var directiveName = model.name + 'List';
		/**
		 * Here is the table code
		 */
		njaxServices.directive.apply(
			null, [
				directiveName,
				[
					'ngTableParams',
					'NJaxSocket',
					function(ngTableParams, NJaxSocket) {
						return {
							replace: true,
							scope: {
								collection: '=collection'
							},
							templateUrl: '/templates/model/' + model.name + '/_table.html',

							//template: '<div>Template A</div>',
							link: function (scope, element, attrs) {
								if(!scope.collection){
									scope.collection = [];
								}

								//Find the parent
								var parent = null;
								if(model.parent) {
									parent = window.njax_bootstrap[model.parent];

									if (!parent) throw new Error("Cannot find parent: " + model.parent);
								}
								//Get the parent URI
								var uri = (parent && parent.uri) || '';
								uri += model.uri_prefix;
								console.log("about to $connect:", uri);
								NJaxSocket.$connect(uri, function(event){
									console.log("onEvent:", event);
									switch(event.event){
										case('create'):
											scope.collection.push(event.data);
										break;
										case('update'):
											for(var i in scope.collection){
												if(scope.collection[i]._id == event.data._id){
													for(var key in event.data){
														scope.collection[i][key] = event.data[key];
													}
												}

											}
										break;
									}
									scope.$digest();

								}).then(function(data){
									//I Dont think anything will happen here
								});

								scope.tableParams = new ngTableParams(
									{
										page: 1,            // show first page
										count: 10           // count per page
									},
									{
										total: scope.collection.length, // length of data
										getData: function ($defer, params) {
											$defer.resolve(
												scope.collection.slice((params.page() - 1) * params.count(), params.page() * params.count())
											);
										}
									}
								)
							}
						}
					}
				]
			]
		);


		/**
		 * Here is the edit form code
		 */
		var scope = {};
		scope[model.name] = '=' + model.name;
		njaxServices.directive.apply(
			null, [
				model.name + 'EditForm',
				[
					model.capitalName,
					function(Model) {
						return {
							replace: true,
							scope: scope,
							templateUrl: '/templates/model/' + model.name + '/_edit.html',

							//template: '<div>Template A</div>',
							link: function (scope, element, attrs) {
								if(!scope[model.name]){
									scope[model.name] = new Model();
								}
								scope.save = function($event){
									$event.preventDefault();
									console.log("Save!")
									scope[model.name].$save().then(function(){
										console.log("Saved!")
									})
								}
							}
						}
					}
				]
			]
		);
	}
}

