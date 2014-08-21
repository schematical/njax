'use strict';
module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            perms:{},
        
    
        
            token:{ type:String },
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        
            account:{ type: Schema.Types.ObjectId, ref: 'Account' },
        
    
        cre_date:Date
    };

    var accesstokenSchema = new Schema(fields);

    accesstokenSchema.virtual('uri').get(function(){
        
            return '/accesstokens/' + this._id;
        
    });

    
        
    
        
    
        
    
        
    


    accesstokenSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
        }
        return next();
    });

    if (!accesstokenSchema.options.toObject) accesstokenSchema.options.toObject = {};
    accesstokenSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        
            

            
        
            

            
        
            

            
        
            

            
        
    }

    return accesstokenSchema;//app.mongoose.model('AccessToken', accesstokenSchema);
}