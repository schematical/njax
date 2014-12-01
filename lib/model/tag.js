'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){
    
        var tagSchema = require('./_gen/tag_gen')(app);
    
    /*
    Custom Code goes here
    */
	tagSchema.virtual('getEntity').get(function(){
		var _this = this;
		return function(callback){
			//console.log("GetEntity:" + _this.entity_type + ' - ' + _this.entity_id);
			if(app.model[_this.entity_type]){
				return app.model[_this.entity_type].findOne({ _id: _this.entity_id }).exec(function(err, entity){
					if(err) return callback(err);
					//console.log(entity);

					return callback(null, entity);
				});
			}

			return callback(new Error("Invalid Entity Type:" + _this.entity_type), null);
		}
	})
    return app.mongoose.model('Tag', tagSchema);
}