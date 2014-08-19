module.exports = function(app){
    app.all('/cache/*', function(req, res, next){
        var path = req.path.substr('cache/'.length);
        var cache_path = app.njax.cachedir(path);
        //return res.send(cache_path);
        res.download(cache_path);
        /*app.njax.s3.getFile(path, app.njax.tmpdir(path), function(err, content){

        });*/
    });

}