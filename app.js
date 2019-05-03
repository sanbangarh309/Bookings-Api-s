var express = require('express');
var session = require('express-session');
var app = express();
var path    = require('path');
var engine = require('ejs-layout');
app.set('view engine', 'ejs');
app.engine('ejs', engine.__express);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.use(session({secret: 'bangarh',resave: true,
    saveUninitialized: true}));
var SuperAdminController = require('./admin/controllers/SuperAdminController');
app.use('/superadmin', SuperAdminController);

var AdminController = require('./admin/controllers/AdminController');
app.use('/admin', AdminController);

// var UserController = require('./controllers/UserController');
// app.use('/users', UserController);

// var AuthController = require('./auth/AuthController');
// app.use('/api/auth', AuthController);

 var routes = require('./admin/routes/Routes');
 routes(app);

module.exports = app;
