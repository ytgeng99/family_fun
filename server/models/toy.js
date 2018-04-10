var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var titleLengthChecker = (title) => {
    if (!title) {
        return false;
    } else {
        if (title.length < 5 || title.length > 50) {
            return false;
        } else {
            return true;
        }
    }
}
var alphaNumnberTitleChecker = (title) => {
    if (!title) {
        return false;
    } else {
        const regExp = new RegExp(/^[a-zA-Z0-9 ]+$/);
        return regExp.test(title);
    }
}

const titleValidators = [
    {
        validator: titleLengthChecker,
        message: "Title must be at least 5 characters but no more than 50"
    },
    {
        validator: alphaNumnberTitleChecker,
        message: "Title must be alphanumeric"
    }
    
]

var protocolLengthChecker = (protocol) => {
    if (!protocol) {
        return false;
    } else {
        if (protocol.length < 5 || protocol.length > 1000) {
            return false;
        } else {
            return true;
        }
    }
}

const protocolValidators = [
    {
        validator: protocolLengthChecker,
        message: "Protocol must be 5 charcters but no more than 1000 characters"
    }
]

var ToySchema = new mongoose.Schema({
    videoLink: {
        type: String
    },
    title: {
        type: String, 
        required: true, 
        validate: titleValidators
    },
    image: {
        type: String,
        required: true
    },
    protocol: {
        type: String, 
        required: true,
        validate: protocolValidators
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: {
        type: Array
    },
    dislikes: {
        type: Number,
        default: 0
    },
    dislikedBy: {
        type: Array
    },
    createdBy: {
        type: String
    },
    _user: {                  // createdby
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    comments: [{
        type: Schema.Types.ObjectId, 
        ref: 'Comment'
    }]
}, {timestamps: true});

mongoose.model('Toy', ToySchema);