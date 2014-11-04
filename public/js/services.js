angular.module('njax.services', [])
	.constant('getNamespace', function (str) {
		var namespace = str;
		namespace = namespace.toLowerCase();
		namespace = namespace.replace(/[^\w\s]/gi, '');
		namespace = namespace.replace(/ /g,"_");
		return namespace;
	})
	/*.service('NJaxHandlebars', function(){

		if(!Handlebars){
			throw new Error("Must have handelbars included");
		}
		//Iterate through the templates passed in

		//Compile them

		//Stuff them in the NJaxHangelbars


	});*/
