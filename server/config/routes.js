// import responding controller into this file
var User = require('../controllers/users');
var Toy = require('../controllers/toys');
var commentController = require('../controllers/comments');
var config = require('./secret');
var jwt = require('jsonwebtoken');
var path = require('path');
// routes
module.exports = function(app) {
    // User routes
    app.post('/register', User.register); 
    app.post('/login', User.login);
     // middleware
    app.use((req, res, next) => {
        // console.log("token data:",req.headers);
        const token = req.headers['authorization']; // Create token found in headers
        // Check if token was found in headers
        if (!token) {
          // res.json({ success: false, message: 'No token provided' }); // Return error
          next();
        } else {
          // Verify the token is valid
          jwt.verify(token, config.secret, (err, decoded) => {
            // Check if error is expired or invalid
            if (err) {
              res.json({ success: false, message: 'Token invalid: ' + err }); // Return error for token validation
            } else {
              req.decoded = decoded; // Create global variable to use in any request beyond
              next(); // Exit middleware
            }
          });
        }
    });
    app.get('/profile', User.getProfile);
    // app.get('/logout', User.logout);
    // Toy routes
    app.post('/toy', Toy.create);
    app.get('/toys', Toy.getToys);
    app.get('/toy/:id', Toy.editToy);
    app.get('/comments/:id', Toy.getComments);
    app.put('/update', Toy.updateToy);
    app.delete('/delete/:id', Toy.deleteToy);
    app.put('/likeToy', Toy.likeToy);
    app.put('/dislikeToy', Toy.dislikeToy);
    // Comment routes
    app.post('/toy/:id', commentController.create);
    // default route
    // app.all('*', (req, res, next) => {
    //     res.sendFile(path.join(__dirname + './../../client/dist/index.html'));
    // });
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname + './../../client/dist/index.html'));
    });
}