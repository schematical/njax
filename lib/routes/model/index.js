module.exports = function(app){
    /**
     * Model Routes
     */
    
        require('./account')(app);
    
        require('./application')(app);
    
        require('./accessToken')(app);
    
        require('./requestCode')(app);
    

}