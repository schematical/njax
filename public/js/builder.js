/**
 This will build the assets from njax_config.js into working angular files
 */
//TODO: Move this to NJax-UTIL in Bower
var njaxServices = angular.module('njax', []);
njaxServices.factory('NJaxSocket', ['$q', 'NJaxBootstrap', function($q, NJaxBootstrap){
	var socket = io('http://localhost:3030');


	var NJaxSocket = {
		_requests:{},
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
		$request:function(event, data){
			var request_id = new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
			var deferred = $q.defer();
			NJaxSocket._requests[request_id] = deferred;
			data._request_id = request_id;
			socket.emit('$query', data);
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
				'NJaxSocket',
				function(NJaxSocket){
				var njaxResource = (function () {
					return function (data) {
						this._model = model;
						this.data = data;
						return this;
					}
				})();

				njaxResource.$query = function (query) {
					return NJaxSocket.$query(model.capitalName, query, 0);
				}
				njaxResource.prototype.$save = function () {
					return NJaxSocket.$save(model.capitalName, this.data);
				}
				njaxResource.prototype.$archive = function () {


				}
				njaxResource.prototype.connect = function () {

					this._socket = NJaxSocket.join(this.uri);


					return this._socket;
				}
				return njaxResource;

			}
		]);


	},
	buildDirective:function(model){

		var directiveName = model.name + 'List';
		console.log(directiveName);
		njaxServices.directive.apply(
			null, [
				directiveName,
				function() {
					return {
						replace: true,
						scope: {
							//application: '=njaxApplicationWidget'
						},
						//templateUrl: '/templates/directives/adamMap.html',

						template: '<div>Template A</div>',
						link: function (scope, element, attrs) {

						}
					}
				}
			]
		);
	}
}

