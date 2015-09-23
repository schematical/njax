'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){

	return {
		extend: function (subscriptionSchema) {


			subscriptionSchema.virtual('entity').get(function () {
				//Entity
				var _this = this;
				return function (callback) {
					if (app.model[_this.entity_type]) {
						app.model[_this.entity_type].findOne({
							_id: _this.entity_id
						}).exec(function (err, entity) {
							if (err) return callback(err);
							return callback(null, entity);
						});
					}
					return callback(new Error("Unable to find entity"));
				}
			});
			return subscriptionSchema;
		}
	}
}
