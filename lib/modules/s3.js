var async = require('async');
var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');
module.exports = function(app){
    AWS.config.update(app.njax.config.aws);
    var s3 = new AWS.S3();
    return {
        route:function(accept_fields){
            return function(req, res, next){
                console.log("Routing S3");
                var file_keys = Object.keys(req.files);
                if(!req.files || file_keys.length == 0){
                    console.log("Exiting - No files posted in");
                    return next();
                }
                var files = [];

                if(accept_fields){
                    for(var i in accept_fields){
                        if(req.files[accept_fields[i]]){
                            files[i] = req.files[accept_fields[i]];
                        }
                    }
                    if(files.length == 0){
                        console.log("Exiting No Files", files);
                        return next();
                    }
                }else{
                    //POTENTIAL SECURITY RISK:
                    files = req.files;
                }
                async.eachSeries(
                    files,
                    function(file, cb){
                        console.log('File:', file);
                        if(!(file && file.size > 0 && fs.existsSync(file.path))){
                           return cb();
                        }
                        var extension = path.extname(file.originalFilename);
                        var basename = path.basename(file.originalFilename, extension);
                        var file_path = (req.user ? req.user._id : '__anonymous__') + '/' + basename + '._' + new Date().getTime() + '.' + extension;
                        console.log('http://s3.amazonaws.com/' + app.njax.config.aws.bucket_name  +  '/' + file_path);
                        var content = fs.readFileSync(file.path);
                        var params = {
                            Bucket: app.njax.config.aws.bucket_name,
                            Key: file_path,
                            Body: content,
                            ACL: 'public-read',
                            ContentLength: content.length
                        };
                        s3.putObject(params, function (err, aws_ref) {
                            if (err) {
                                return cb(err);
                            }
                            file.s3_path = file_path;
                            return cb(null);
                        });
                    },
                    function(){
                        return next();
                    }
                );
            }
        },
        getFile:function(){
            async.series([
                function(cb){
                    mkdirp(dir, function (err) {
                        if(err) return callback(err);
                        return cb();
                    });
                },
                function(cb){
                    var stream = require('fs').createWriteStream(local_file_path);

                    stream.loc = local_file_path;
                    stream.name = _this.name;
                    stream.dir = dir;
                    var params = {
                        Bucket: config.aws.bucket_name,
                        Key:file_path
                    }
                    var body = '';
                    s3.getObject(params).
                        on('httpData',function (chunk) {
                            stream.write(chunk);
                            body += chunk;
                        }).
                        on('httpDone',function () {
                            stream.end(null, null, function(){
                                callback(null, body, local_file_path);
                            });

                        }).
                        send();
                }
            ]);
        }
    }
}