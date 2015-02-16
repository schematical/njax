var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	app.njax.subscription = {
		add:function(account, entity, subscription_data, callback){
			if(!account || !account._njax_type || account._njax_type != 'Account'){
				return callback(new Error("Need an valid account to add the subscription to"));
			}
			if(!entity._njax_type){
				return callback(new Error("Not a valid entity for subscriptionging"));
			}
			var url = entity.api_url || entity.url;
			if(!url){
				return callback(new Error("Not a valid entity for subscription"));
			}
			if(_.isString(subscription_data)){
				subscription_data = {
					type:subscription_data
				}
			}
			var subscription = null;
			async.series([
			    function(cb){
					var or_condition = [];
					or_condition.push({ entity_id: entity._id });
					or_condition.push({ entity_url: entity.api_url });
					or_condition.push({ entity_url: entity.url });
					return app.model.Subscription.find({
						account:account._id,
						$or: or_condition
					}).exec(function(err, subscriptions){
						if(err) return callback(err);
						if(subscriptions.length > 0){
							return callback(new Error("Subscription already exists"), subscriptions[0]);
						}
						return cb();
					});
			    },
				function(cb){
					subscription = new app.model.Subscription(subscription_data);
					//subscription.type = type;
					subscription.entity_type = entity._njax_type;
					subscription.entity_url = entity.api_url;
					subscription.entity_id = entity._id;
					subscription._entity_name = entity.name;
					subscription._entity_namespace = entity.namespace;
					subscription.account = account._id;

					subscription.save(function(err){
						if(err) throw err;
						if(err) callback(err);
						return cb();
					});

				}
			],
			function(){
			    //end async
				return callback(null, subscription);
			});



		},
		query:function(query, callback){
			if(_.isString(query)){
				query = { entity_url: query }
			}else if(query._njax_type){
				var entity = query;
				var or_condition = [];
				or_condition.push({ entity_id: entity._id });
				or_condition.push({ entity_url: entity.api_url });
				or_condition.push({ entity_url: entity.url });
				query = {
					$or:or_condition,
					entity_type:query._njax_type
				}
			}
			console.log("Query:", query);
			return app.model.Subscription.find(
				query
			)
			.populate('account')
			.exec(function(err, subscriptions){
					if(err) return callback(err);

					return  callback(null, subscriptions);
			});

		},
		remove:function(account, entity, callback){
			var query = {

			};
			var account_id = null;
			if(_.isString(account)) {
				account_id = account;
			}else if(account._njax_type == 'Account'){
				account_id = account._id;
			}else{
				return callback(new Error("Invalid Account"));
			}
			if(entity && _.isString(entity)) {
				query.entity_url = entity;
			}else if(entity && entity.api_url){
				query.entity_url = entity.api_url;
			}else if(entity && entity._id && entity._njax_type){
				query.entity_id = entity._id;
				query.entity_type = entity._njax_type;
			}else{
				return callback(new Error("Invalid Entity"));
			}

			return app.model.Subscription.findOne(
				query
			)
			.exec(function(err, subscription){
				if(err) return callback(err);
				return subscription.remove(function(err){
					if(err) return callback(err);
					return  callback(null, subscription);
				});
			});

		}
	}


}