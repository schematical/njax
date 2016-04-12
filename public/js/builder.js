
var njaxServices = angular.module('njax');
window.NJax = {};
window.NJax.Builder = {
	_extended: {},
	extend: function (module, data) {
		window.NJax.Builder._extended[module] = 1;
		njaxServices.factory(module, data);
	},
	build: function (njax_config) {
		njax_config = njax_config || window.njax_config;
		NJax.Builder.extendDefaultResources();
		for (var model_name in njax_config.models) {

			var model = njax_config.models[model_name];
			NJax.Builder.buildResource(NJax, model);
			NJax.Builder.buildDirective(model);
		}
	},
	extendDefaultResources: function () {

		NJax.Builder.extend(
			'Account',
			['nAccount', '$q', '$http', 'NJaxSocket', 'NJaxBootstrap', function(nAccount, $q, $http, NJaxSocket, NJaxBootstrap) {
				/** Static function **/
				nAccount.namespace_available = function (namespace) {
					var deferred = $q.defer();
					nAccount.$query({namespace:namespace}).then(function(data){
						if(data.response.length == 0){
							return deferred.resolve();
						}
						return deferred.reject(new Error("There is already an account with this namespace"));
					})
					return deferred.promise;
				}
				nAccount.register = function (data) {
					var deferred = $q.defer();
					return $http.post(NJaxBootstrap.core_api_url + '/register', data);
				}
				return nAccount;
			}
			]
		)
	},
	buildResource: function (NJax, model) {

		njaxServices.factory(
			'n' + model.capitalName,
			[
				'$q',
				'$injector',
				'NJaxSocket',
				function ($q, $injector, NJaxSocket) {
					var njaxResource = (function () {
						return function (data) {
							this._model = model;
							this.data = data || {};
							var _this = this;

							for (var key in model.fields) {
								(function (_key) {
									Object.defineProperty(
										_this,
										_key,
										{
											set: function (val) {
												return _this.data[_key] = val;
											},
											get: function () {
												switch (model.fields[_key].type){
													case("date"):
														if(_this.data[_key]) {
															if(!(_this.data[_key] instanceof Date)){
																_this.data[_key] = new Date(_this.data[_key]);
															}
															return _this.data[_key];
														}else{
															return null;
														}
													break;
													default:
														return _this.data[_key];
												}

											}
										}
									);
								})(key);

							}
							Object.defineProperty(
								_this,
								'_is_njax',
								{
									get: function () {
										return true;
									}
								}
							);
							Object.defineProperty(
								_this,
								'_id',
								{
									get: function () {
										return _this.data._id;
									}
								}
							);
							Object.defineProperty(
								_this,
								'_parent_uri',
								{
									get: function () {
										return _this.data._parent_uri;
									}
								}
							);
							Object.defineProperty(
								_this,
								'uri',
								{
									get: function () {
										return _this.data.uri;
									}
								}
							);
							Object.defineProperty(
								_this,
								'url',
								{
									get: function () {
										return _this.data.url;
									}
								}
							);
							Object.defineProperty(
								_this,
								'api_url',
								{
									get: function () {
										return _this.data.api_url;
									}
								}
							);
							return this;
						}
					})();

					njaxResource.$query = function (query) {

						var deferred = $q.defer();
						NJaxSocket.$query(model.capitalName, query, 0).then(function (data) {
							for (var i in data.response) {
								data.response[i] = new njaxResource(data.response[i]);
							}
							deferred.resolve(data);
							return data;
						});
						return deferred.promise;
					}
					if(model.parent){

						njaxResource.prototype.parent = function () {
							var _this = this;
							var deferred = $q.defer();
							var parent = window.njax_config.models[model.fields[model.parent].ref];
							var Parent = $injector.get(parent.capitalName);
							Parent.$query({
								_id: _this[model.parent]
							}).then(function (data) {
								var parent_instance = null;
								if(data.response.length == 1){
									parent_instance = data.response[0];
								}
								deferred.resolve(parent_instance);
								return parent_instance;
							});

							return deferred.promise;
						}
					}
					njaxResource.prototype.isOwner = function(user_id){
						var deferred = $q.defer();
						if(!user_id){
							throw new Error("Must test against a valid user");
						}
						if(user_id._id){
							user_id = user_id._id;
						}


						//Check lineage
						var checkIfIsOwner =  function (instance) {
							if(!instance){
								return deferred.reject(new Error("Could not find parent"));
							}
							if(instance.owner){
								return deferred.resolve((instance.owner == user_id));

							}
							if(!instance.parent){
								return deferred.resolve(false);
							}
							return instance.parent().then(checkIfIsOwner)
						}

						checkIfIsOwner(this);
						return deferred.promise;

					}
					njaxResource.prototype.$save = function () {
						var _this = this;
						var deferred = $q.defer();

						NJaxSocket.$save(model.capitalName, this.data).then(function (data) {
							_this.data = data.response;
							deferred.resolve(this);
						})
						return deferred.promise;
					}
					njaxResource.prototype.$archive = function () {
						var _this = this;
						var deferred = $q.defer();

						NJaxSocket.$archive(model.capitalName, this._id).then(function (data) {
							//_this.data = data.response;
							deferred.resolve(this);
						})
						return deferred.promise;

					}
					njaxResource.prototype.connect = function (cb) {
						var deferred = $q.defer();
						var _this = this;
						return NJaxSocket.$connect(this.uri,cb);

					}

					return njaxResource;

				}
			]
		);


		if (!window.NJax.Builder._extended[model.capitalName]) {
			njaxServices.factory(
				model.capitalName,
				[
					'n' + model.capitalName,
					function (Model) {
						return Model;
					}
				]
			)
		}


	},
	buildRoutes: function ($urlRouterProvider, $stateProvider) {
		$stateProvider.state('home', {
			url: '/',
			views: {
				body: {
					templateUrl: '/templates/home.html',
					controller: function ($scope) {
						console.log("Home Hit");
					}
				}
			}
		});
		for (var key in  window.njax_config.models) {


			(function (_model) {

				var parent = null;
				if(_model.parent){
					parent = window.njax_config.models[_model.fields[_model.parent].ref];
				}


				var addToBreadcrumbs = function($scope){
					if(!$scope.breadcrumbs){
						$scope.breadcrumbs = [];

					}


					return function (instance) {
						$scope[instance._model.name] = instance;
						if(instance)

						$scope.breadcrumbs.push({
							url:'//' + instance.url,
							name: instance.name
						})
						$scope.breadcrumbs.push({
							url:(instance._parent_uri || '')+ instance._model.uri_prefix,
							name: instance._model.capitalName + 's'
						});
						if(instance.parent) {
							instance.parent().then(addToBreadcrumbs($scope))
						}else{
							$scope.breadcrumbs.reverse();
						}

					}
				}

				$stateProvider.state(_model.name + '_list', {
					url:_model.full_url_prefix,
					views: {
						body: {
							templateUrl: '/templates/model/' + _model.name + '/list.html',
							controller: ['$scope', '$stateParams', '$injector',  _model.capitalName, function ($scope, $stateParams, $injector, Model) {
								$scope.query = function(query){
									Model.$query(query).then(function (data) {
										$scope[_model.name + 's'] = data.response;
									});
								}
								if(_model.parent) {
									var Parent = $injector.get(parent.capitalName);

									Parent.$query({ _id: $stateParams[parent.name] }).then(function(data){
										var instance = null;
										if(data.response.length == 1){
											instance = data.response[0];
										}
										$scope.parent = instance;
										addToBreadcrumbs($scope)(instance);
										var query = {}
										query[_model.parent] = instance._id;
										$scope.query(query);
									});
								}else{
									$scope.query({});
								}




							}]
						}
					}

				});



				$stateProvider.state(_model.name + '_detail', {
					url: _model.full_url_prefix + '/:' + _model.name,
					views: {
						body: {
							templateUrl: '/templates/model/' + _model.name + '/detail.html',
							controller: ['$scope', '$stateParams', _model.capitalName, function ($scope, $stateParams, Model) {



								$scope.breadcrumbs = [];



								Model.$query({_id: $stateParams[_model.name]}).then(function (data) {

									if (data.response.length > 0) {
										$scope[_model.name] = instance =  data.response[0];
									}
									addToBreadcrumbs($scope)(instance);

								})

							}]
						}
					}

				})
			})(window.njax_config.models[key]);

		}
		window.NJax.Builder.buildDefaultRoutes($urlRouterProvider, $stateProvider);
		$urlRouterProvider.otherwise('/');
	},
	buildDefaultRoutes: function ($urlRouterProvider, $stateProvider) {
		$stateProvider.state('register', {
			url: '/register',//TODO: Add Parent,
			views: {
				body: {
					templateUrl: '/templates/register.html',
					controller: 'RegisterPageCtl'
				}
			}

		})
	},
	buildDirective: function (model) {

		var directiveName = model.name + 'List';
		/**
		 * Here is the table code
		 */
		njaxServices.directive.apply(
			null, [
				directiveName,
				[
					'$location',
					'ngTableParams',
					'NJaxSocket',
					model.capitalName,
					function ($location, ngTableParams, NJaxSocket, Model) {
						return {
							replace: true,
							scope: {
								parent: '=parent',
								collection: '=collection'
							},
							templateUrl: '/templates/model/' + model.name + '/_table.html',

							//template: '<div>Template A</div>',
							link: function (scope, element, attrs) {
								if (!scope.collection) {
									scope.collection = [];
								}


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
								);

								scope.archiveSelected = function ($event) {

									for (var i in scope.collection) {
										if (scope.collection[i]._selected) {
											scope.collection[i].$archive()
										}
									}
								}
								scope.selectInstance = function ($event, instance) {
									$event.preventDefault();
									$location.path(instance.uri);
									//window.history.pushState({"html":"<h1>","pageTitle":'dramboui'}, 'Title', '/page2.php');
									console.log("Instance Selected");
								}

								//Find the parent

								if (model.parent) {
									if(!scope.parent) {

										scope.parent = window.njax_bootstrap[model.parent] || null;

										//if (!$scope.parent) throw new Error("Cannot find parent: " + model.parent);
									}
								}
								if (!model.parent || scope.parent) {
									//Get the parent URI
									var uri = (scope.parent && scope.parent.uri) || '';
									uri += model.uri_prefix;
									console.log("about to $connect:", uri);
									NJaxSocket.$connect(uri, function (event) {
										console.log("onEvent:", event);
										switch (event.event) {
											case('create'):
												scope.collection.push(event.data);
												break;
											case('update'):
												for (var i in scope.collection) {
													if (scope.collection[i]._id == event.data._id) {
														for (var key in event.data) {
															scope.collection[i][key] = event.data[key];
														}
													}

												}
												break;
											case('archive'):
												for (var i in scope.collection) {
													if (scope.collection[i]._id == event.data._id) {
														scope.collection.splice(i, 1);
													}

												}
												break;
										}
										scope.$digest();

									}).then(function (data) {
										//I Dont think anything will happen here
									});
								}


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
					function (Model) {
						return {
							replace: true,
							scope: scope,
							templateUrl: '/templates/model/' + model.name + '/_edit.html',

							//template: '<div>Template A</div>',
							link: function (scope, element, attrs) {

								if (!scope[model.name]) {
									scope[model.name] = new Model();
								}
								scope.$parent.$watch(model.name + '._id', function( newVal){
									console.log(model.name + ':',  newVal);
									scope[model.name] = scope.$parent[model.name];

								});
								scope.save = function ($event) {
									$event.preventDefault();
									console.log("Save!")
									scope[model.name].$save().then(function () {
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

