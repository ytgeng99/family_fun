var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
mongoose.connect("mongodb://localhost/family_fun");
mongoose.Promise = global.Promise;

// define a variable which refers to the models location
var models_path = path.join(__dirname, "./../models");
fs.readdirSync(models_path).forEach(function(file){
    if (file.indexOf('.js') >= 0) {
        require(models_path + '/' + file);
    }
});