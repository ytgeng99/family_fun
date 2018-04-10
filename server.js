// Express dependencies
var express = require('express');
var app = express();
var path = require('path');
var session = require('express-session');
var cors = require('cors');
var port = 8000;
// body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// Static folder
app.use(express.static(path.join(__dirname, '/client/dist')));
// Session
// app.use(session({secret: 'familyFunTogether'}));
// app.use(cors({ origin: 'http://localhost:8000' })); 
// db and web server link
require('./server/config/mongoose.js');
require('./server/config/routes.js')(app);

// listening port
app.listen(port, () =>
    console.log(`listening on port ${port}`)
);
