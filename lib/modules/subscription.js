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
					var subscription = new app.model.Subscription(subscription_data);
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
				return callback();
			});



		},
		query:function(query, callback){
			if(query._njax_type){
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
			return app.model.Subscription.find(
				query
			)
			.populate('account')
			.exec(function(err, subscriptions){
					if(err) return callback(err);

					return  callback(null, subscriptions);
			});

		}
	}
}