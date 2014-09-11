module.exports = function(app){
    /**
     * Model Routes
     */
    
        require('./_old/account')(app);
    
        require('./_old/application')(app);
    
        require('./_old/accessToken')(app);
    
        require('./_old/requestCode')(app);
    

}