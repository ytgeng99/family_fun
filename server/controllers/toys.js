var mongoose = require('mongoose');
var Toy = mongoose.model('Toy');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var config = require('./../config/secret');
class toyController {
    // create a new toy information
    create(req, res) {
        User.findById(req.decoded.userId, function(err, user) {
            var newToy = new Toy({
                videoLink: req.body.videoLink,
                title: req.body.title,
                image: req.body.image,
                protocol: req.body.protocol,
                // createdBy: req.body.createdBy
            });
            newToy.createdBy = user.username;
            newToy._user = user._id;
            user.toys.push(newToy);
            user.save(function(err){
                if(err){
                    res.json({success: false, message:err});
                } else {
                    newToy.save(function(err, toy){
                        if(err) {
                            res.json({success: false, message: err});
                        } else {
                            res.json({success: true, message: 'New toy is saved successfully'});
                        }
                    });
                }
            });
        })
    }
    // get all created toys by user
    getToys(req, res){
        Toy.find({}, (err, toys) => {
            if (err) {
                res.json({success: false, message: err});
            } else {
                if (!toys) {
                    res.json({ success: false, message: "Not toys found"});
                } else {
                    console.log("all toys: ", toys);
                    res.json({ success: true, toys: toys});
                }
            }
        }).sort({'_id': -1});
    }

    // get single toy by id
    editToy(req, res){
        Toy.findOne({ _id: req.params.id }, function(err, toy){
            if(err) {
                res.json({ success: false, message: err});
            } else if (!toy) {
                res.json({ success: false, message: 'Toy not found'});
            } else {
                User.findOne({ _id: req.decoded.userId}, function(err, user){
                    if (err) {
                        res.json({success: false, message: err});
                    } else {
                        if (!user){
                            res.json({success: false, message: "user not found"});
                        } else {
                            console.log(user.username == toy.createdBy);
                            console.log('user id:', user._id);
                            console.log('toy user:', toy._user);
                            if(user.username !== toy.createdBy){
                                res.json({ success: false, message:"You are not authorized to edit this toy"});
                            } else {
                                res.json({ success: true, toy: toy});
                            }
                        }
                    }
                });
            }
        });
    }

    getComments(req, res) {
        Toy.findOne({_id: req.params.id}).populate('comments').exec(function(err, toy){
            if (err) {
                res.json({success: false, message: err});
            } else {
                res.json({success: true, comments: toy.comments});
            }
        })
    }

    // update a toy
    updateToy(req, res){
        Toy.findOne({_id: req.body._id}, function(err, toy){
            if(err) {
                res.json({ success: false, message:'not a valid toy id'});
            } else {
                if (!toy) {
                    res.json({ success: false, message: 'toy is not found'});
                } else {
                    User.findOne({_id: req.decoded.userId}, function(err, user){
                        if(err) {
                            res.json({ success: false, message: err});
                        } else {
                            if (user.username !== toy.createdBy) {
                                res.json({ success: false, message:"You are not authorized to edit this toy"});  
                            } else {
                                toy.videoLink = req.body.videoLink;
                                toy.title = req.body.title;
                                toy.image = req.body.image;
                                toy.protocol = req.body.protocol;
                                toy.save(function(err){
                                    if(err){
                                        res.json({ success: false, message: err})
                                    } else {
                                        res.json({ success: true, message: 'Toy updated successfully'});
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    // delete a toy
    deleteToy(req, res) {
        Toy.findOne({_id: req.params.id}, function(err, toy){
            if (err) {
                res.json({ success: false, message: 'invalid toy id'});
            } else {
                if(!toy) {
                    res.json({ success: false, message: 'toy is not found'});
                } else {
                    User.findOne({_id: req.decoded.userId}, function(err, user){
                        if(err) {
                            res.json({ success: false, message: err});
                        } else {
                            if(!user) {
                                res.json({success: false, message: 'unable to authenticate user'});
                            } else {
                                if(user.username != toy.createdBy) {
                                    res.json({success: false, message: "You are not authorized to edit this toy"});
                                } else {
                                    // also remove toy from user.toys
                                    var index = user.toys.indexOf(toy._id);
                                    user.toys.splice(index, 1);
                                    toy.remove(function(err){
                                        if(err) {
                                            res.json({success: false, message: err});
                                        } else {
                                            user.save(function(err){
                                                if(err) {
                                                    res.json({success: false, message: err});  
                                                } else {
                                                    res.json({success: true, message:'toy is successfully deleted'});
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });
    }

    // like a toy post
    likeToy(req, res){
        if(!req.body.id) {
            res.json({success:false, message:"Id was not provided"});
        } else {
            Toy.findOne({_id: req.body.id}, function(err, toy){
                if(err) {
                    res.json({success: false, message: 'Invalid toy id'});
                } else {
                    if(!toy) {
                        res.json({ success: false, message:'That toy was not found'});
                    } else {
                        User.findOne({_id: req.decoded.userId}, function(err, user){
                            if(err) {
                                res.json({ success: false, message:err});
                            } else {
                                if(!user) {
                                    res.json({ success: false, message:'The user was not found'});
                                } else {
                                    if(user.username === toy.createdBy){
                                        res.json({success: false, message: 'Can not like your own toy'});
                                    } else {
                                        // check if user who liked the toy post has already liked the toy post
                                        if(toy.likedBy.includes(user._id)) {
                                            res.json({success: false, message:'You have already liked the toy'});
                                        } else {
                                            // check if user who liked post has previously disliked this toy
                                            if(toy.dislikedBy.includes(user._id)) {
                                                toy.dislikes--;
                                                let index = toy.dislikedBy.indexOf(user._id);
                                                toy.dislikedBy.splice(index, 1);
                                                toy.likes++;
                                                toy.likedBy.push(user._id);
                                                toy.save(function(err){
                                                    if(err) {
                                                        res.json({ success: false, message: err});
                                                    } else {
                                                        res.json({ success: true, message:'like this toy'});
                                                    }
                                                });
                                            } else {
                                                toy.likes++;
                                                toy.likedBy.push(user._id);
                                                toy.save(function(err){
                                                    if(err) {
                                                        res.json({ success: false, message: err});
                                                    } else {
                                                        res.json({ success: true, message:'like this toy'});
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    }
    // dislike a toy
    dislikeToy(req, res){
        if (!req.body.id) {
            res.json({success:false, message:"Id was not provided"}); 
        } else {
            Toy.findOne({_id: req.body.id}, function(err, toy){
                if(err){
                    res.json({success: false, message: 'Invalid toy id'});
                } else {
                    if(!toy) {
                        res.json({ success: false, message: 'the toy was not found'});
                    } else {
                        User.findOne({_id: req.decoded.userId}, function(err, user){
                            if(err){
                                res.json({success: false, message:err});
                            } else {
                                if(!user) {
                                    res.json({success: false, message:'user was not found'});
                                } else {
                                    if(user._id === toy._user){
                                        res.json({success: false, message:'You can not dislikes your own toy'});
                                    } else {
                                        if (toy.dislikedBy.includes(user._id)) {
                                            res.json({success: false, message: 'You have already disliked this toy'});
                                        } else {
                                            // check if user has liked this toy
                                            if(toy.likedBy.includes(user._id)) {
                                                toy.likes--;
                                                let index = toy.likedBy.indexOf(user._id);
                                                toy.likedBy.splice(index, 1);
                                                toy.dislikes++;
                                                toy.dislikedBy.push(user._id);
                                                toy.save(function(err){
                                                    if(err){
                                                        res.json({success: false, message: err});
                                                    } else {
                                                        res.json({success: true, message:'dislike this toy'});
                                                    }
                                                });
                                            } else {
                                                toy.dislikes++;
                                                toy.dislikedBy.push(user._id);
                                                toy.save(function(err){
                                                    if(err){
                                                        res.json({success: false, message: err});
                                                    } else {
                                                        res.json({success: true, message:'dislike this toy'});
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    }
}
module.exports = new toyController();