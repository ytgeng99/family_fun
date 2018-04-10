var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var config = require('./../config/secret');
var bcrypt = require('bcrypt');
const saltRounds = 10;
class userController {
    register(req, res) {
        User.findOne({email: req.body.email}, function(err, user) {
            if (err) {
                res.json({success: false, message: err});
            } else if (user) {
                console.log('this email has already exist');
                res.json({
                    success: false, 
                    message: 'This email has been taken'
                });
            } else {
                var newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            res.json({success: false, message: err});
                        } else {
                            newUser.password = hash;
                            newUser.toys = [];
                            newUser.save(function(err){
                                if (err) {
                                    res.json({ success: false, message: err});
                                } else {
                                    // req.session.currUser_Id = newUser._id;
                                    res.json({ success: true, message: 'Register a new account'});
                                }
                            });
                        }
                    });
                })
            }
        });
    }

    login(req, res) {
        User.findOne({email: req.body.email}, function(err, user) {
            if (err) {
                res.json({ success: false, message: err});
            } else {
                if (user) {
                    bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if (err) {
                            res.json({ success: false, message: 'Invalid password'});
                        } else if (result) {
                            // req.session.currUser_Id = user._id;
                            // console.log("req.session at login:", req.session);
                            const token = jwt.sign({ userId: user._id}, config.secret, { expiresIn: '24h' });
                            res.json({
                                success: true,
                                message: 'Longin successfully',
                                token: token,
                                user: {
                                    username: user.username
                                }
                            });
                        } else {
                            res.json({success: false, message:'password is not matched'});
                        }
                    }) 
                } else {
                    res.json({ success: false, message: 'Email is not in database, please register an account firstly'});
                }
            }
        });
    }
    // two ways to implement this method
    // getProfile(req, res) {
    //     User.findById(req.session.currUser_Id)
    //     .populate('toys')
    //     .exec(function(err, user){
    //         if(err) {
    //             console.log(err);
    //         } else {
    //             res.json(user);
    //         }
    //     });
    // }
    getProfile(req, res) {
        // console.log("req.decoded:", req.decoded);
        User.findById(req.decoded.userId)
        .populate('toys')
        .exec(function(err, user){
            if(err) {
                res.json({success: false, message: err});
            } else {
                res.json({ success: true, user: user});
            }
        });
    }
    // or if use the jsontoken, logout method is not necessary
    // logout(req, res) {
    //     req.session.destroy(function(err) {
    //         console.log("req.session after logout:",req.session);
    //         if (err) {
    //             res.json({success: false, message: err});
    //         } else {
                
    //             res.json( {success: true, message: 'req.session is cleared out'});
    //         }
    //     });
    // }
}
module.exports = new userController();