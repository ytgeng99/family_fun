var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Name is required'],
        minlength: [2, 'Name must be at least 2 characters'],
        trim: true 
    },
    email: { 
        type: String, 
        validate: {
            validator: function(email) {
                var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  		        return emailRegex.test(email)
            },
            message: 'Not a valid email'
        },
        required: [true, 'Email is required'],
        unique: true 
    },
    password: { 
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function(ps) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,32}/.test(ps);
            },
            message: "Password is not valid, it must have at least one number, uppercase and special character"
        },
        required: true,
    },
    toys: [{
        type: Schema.Types.ObjectId, 
        ref: 'Toy'
    }]
}, { timestamps: true});
mongoose.model('User', UserSchema);