'use strict';
module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    
        
            code:{ type:String },
        
    
        
            application:{ type: Schema.Types.ObjectId, ref: 'Application' },
        
    
        cre_date:Date
    };

    var requestcodeSchema = new Schema(fields);

    requestcodeSchema.virtual('uri').get(function(){
        
            return '/requestcodes/' + this._id;
        
    });

    
        
    
        
    


    requestcodeSchema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
        }
        return next();
    });

    if (!requestcodeSchema.options.toObject) requestcodeSchema.options.toObject = {};
    requestcodeSchema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        
            

            
        
            

            
        
    }

    return requestcodeSchema;//app.mongoose.model('RequestCode', requestcodeSchema);
}