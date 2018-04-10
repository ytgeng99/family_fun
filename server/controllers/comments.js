var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');
var Toy = mongoose.model('Toy');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var config = require('./../config/secret');
class commentController{
    create(req, res){
        Toy.findOne({_id: req.params.id}, function(err, toy){
            if(err) {
                res.json({success: false, message: 'invalid toy id'});
            } else {
                if(!toy) {
                    res.json({success: false, message:'toy was not found'});
                } else {
                    User.findOne({_id: req.decoded.userId}, function(err, user){
                        if(err) {
                            res.json({success: false, message:err});
                        } else {
                            if(!user){
                                res.json({success:false, message:'user was not found'});
                            } else {
                                // create comment from HTML form
                                var comment = new Comment({
                                    content: req.body.content,
                                    // commentedBy: user.username
                                });
                                comment.commentedBy = user.username;
                                // set reference with user and toy table
                                comment._toy = toy._id;
                                // save both comment and toy 
                                comment.save(function(err){
                                    if(err){
                                        res.json({success: false, message: err});
                                    } else {
                                        toy.comments.push(comment);
                                        toy.save(function(err){
                                            if(err){
                                                res.json({success: false, message:err});
                                            } else {
                                                res.json({success: true, message:'comment added'});
                                            }
                                        });
                                    }
                                }); 
                            }
                        }
                    });
                }
            }
        });
    }
}
module.exports = new commentController();