'use strict';
module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            email:{ type:String },
        
    
        
            name:{ type:String },
        
    
        
            namespace:{ type:String },
        
    
        cre_date:Date
    };

    var accountSchema = new Schema(fields);

    accountSchema.virtual('uri').get(function(){
        
            return '/accounts/' + this.namespace;
        
    });

    
        
    
        
    
        
    


    accountSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
        }
        return next();
    });

    if (!accountSchema.options.toObject) accountSchema.options.toObject = {};
    accountSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        
            

            
        
            

            
        
            

            
        
    }

    return app.mongoose.model('Account', accountSchema);
}