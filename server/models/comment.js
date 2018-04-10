var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 200
    },
    commentedBy: {        
        type: String
    },
    _toy: {          // belonging to toy
        type: Schema.Types.ObjectId,
        ref: 'Toy'
    }
}, {timestamps: true});

mongoose.model('Comment', CommentSchema);