module.exports = function () {
	var config = {
		"njax_module": true,
		"models": {
			"account": {
				"uri_prefix": "",
				"name": "account",
				"tpl_override": {
					"schema": "lib/model/account.default.js"
				},
				"default": true,
				"fields": {
					"email": "email",
					"name": "string",
					"namespace": "namespace",
					"active": {"type": "boolean"},
					"forgot_pass_code": {"type": "string"}
				}
			},
			"application": {
				"name": "application",
				"uri_prefix": "/apps",
				"default": true,
				"fields": {
					"thumb_img": "s3-asset",
					"namespace": "namespace",
					"name": "string",
					"desc": "md",
					"app_url": "string",
					"domain": "string",
					"secret": "string",
					"level": {
						"type": "tpcd",
						"options": {
							"SUPER": "super",
							"PARTNER": "partner",
							"UNKNOWN": "unknown",
							"FEATURED": "featured",
							"BETA": "beta",
							"ALPHA": "alpha",
							"LAB": "lab",
							"DEV": "dev"
						}
					},
					"callback_url": "string",
					"iframes": "object",
					"bootstrap_data": {type: "object"},
					"owner": {
						"type": "ref",
						"ref": "account",
						"bootstrap_populate": "req.user"
					},
					"widgets": "object",
					auth_url: "string"
				},
				"active": {"type": "boolean"}
			},
			"accessToken": {
				"uri_prefix": "/access_tokens",
				"name": "accessToken",
				"default": true,
				"fields": {
					"perms": "array",
					"token": "string",
					"application": {
						"type": "ref",
						"ref": "application",
						"bootstrap_populate": "req.application"
					},
					"account": {
						"type": "ref",
						"ref": "account",
						"bootstrap_populate": "req.user"
					}
				}
			},
			"requestCode": {
				"uri_prefix": "/request_codes",
				"name": "requestCode",
				"default": true,
				"fields": {
					"code": "string",
					"application": {
						"type": "ref",
						"ref": "application",
						"bootstrap_populate": "req.user"
					}
				}
			},

			"event": {
				"uri_prefix": "/events",
				"name": "event",
				"default": true,
				"fields": {
					"event_namespace": "string",
					"short_namespace": "string",
					"entity_url": "string",
					"entity_type": "string",
					"entity_id": "string",
					"data": {"type": "object"},

					"application": {
						"type": "ref",
						"ref": "application",
						"bootstrap_populate": "req.application"
					},
					"accounts": {"type": "array"},
					"mutedDate": "date"
				}
			},
			"tag": {
				"uri_prefix": "/tags",
				"name": "tag",
				"relationship": "assoc",
				"default": true,
				"fields": {
					"type": "string",
					"sub_type": "string",
					"value": "string",
					"entity_type": "string",
					"entity_url": "string",
					"entity_id": "string",
					"_entity_name": "strings",
					"_entity_namespace": "strings",

					"application": {
						"type": "ref",
						"ref": "application",
						"bootstrap_populate": "req.application"
					},
					"account": {
						"type": "ref",
						"ref": "account",
						"bootstrap_populate": "req.user"
					}
				}
			},
			"subscription": {
				"uri_prefix": "/subscriptions",
				"name": "subscription",
				"relationship": "assoc",
				"parent": "account",
				"default": true,
				"fields": {
					"event_filters": ["string"],
					"short_namespace": "string",
					"type": "string",
					"entity_url": "string",
					"entity_type": "string",
					"entity_id": "string",
					"data": {"type": "object"},
					"_entity_name": "strings",
					"_entity_namespace": "strings",
					"application": {
						"type": "ref",
						"ref": "application",
						"bootstrap_populate": "req.application"
					},
					"account": {
						"type": "ref",
						"ref": "account",
						"bootstrap_populate": "req.user"
					}
				}
			},
			"user_group": {
				"uri_prefix": "/user_groups",
				"name": "user_group",
				"default": true,
				"fields": {
					"name": "string",
					"namespace": "string",
					"account": {
						"type": "ref",
						"ref": "account",
						"bootstrap_populate": "req.user"
					}
				}
			},
			"user_group_member": {
				"uri_prefix": "/members",
				"name": "user_group_member",
				"relationship": "assoc",
				"default": true,
				"fields": {}
			}
		},
		bower: {
			"name": "nde",
			"version": "1.0.0",
			"main": "path/to/main.css",
			"ignore": [
				".jshintrc",
				"**/*.txt"
			],
			"dependencies": {
				"jquery": "*",
				"angular": "*",
				"ace": "*",
				"underscore": "*",
				"async": "*"

			}
		},
		package: {
			"name": "?",
			"version": "0.0.1",
			"private": true,
			"scripts": {
				"start": "node app.js"
			},
			dependencies: {
				"async": "*",
				"underscore": "*",
				"mongoose": "*",
				"errorhandler": "*",
				"markdown": "*",
				"connect-multiparty": "*",
				"aws-lib": "*",
				"aws-sdk": "*",
				"socket.io": "*",
				"mkdirp": "*",
				"njax": "git+ssh://git@github.com:schematical/njax.git#master",
				"njax-bootstrap": "git+ssh://git@github.com:schematical/njax-bootstrap.git#master"
			}
		},
		cordova: {}
	}
	return config;


}