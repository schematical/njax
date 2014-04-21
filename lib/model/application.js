'use strict';



module.exports = function(app){
    var fields = {
        _id: { type: Schema.Types.ObjectId },
        name: { type: String },
        namespace: { type: String },
        creDate: { type: Date , default: Date.now }
    };
    var applicationSchema = new app.mongoose.Schema(fields);


    var ApplicationModel = app.mongoose.model('Application', applicationSchema);


    return ApplicationModel;
}