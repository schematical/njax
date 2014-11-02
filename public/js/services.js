angular.module('njax.services', [])
	.constant('getNamespace', function (str) {
		var namespace = str;
		namespace = namespace.toLowerCase();
		namespace = namespace.replace(/[^\w\s]/gi, '');
		namespace = namespace.replace(/ /g,"_");
		return namespace;
	});
