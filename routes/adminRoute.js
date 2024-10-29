const express = require("express");
const path = require('path');
const multer = require('multer');
const session = require("express-session");
const bodyParser = require("body-parser");
const config = require("../config/config");
const auth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

const admin_route = express();

// Session middleware
admin_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// Body parser middleware
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

// View engine setup
admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

// Static files middleware
admin_route.use(express.static('public'));

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'));
    },
    filename: function(req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

function noCache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
    next();
}

admin_route.use(noCache);


// Admin routes
admin_route.get('/', auth.isLogout, adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);
admin_route.get('/home', auth.isLogin, auth.isAdmin,  adminController.loadDashboard);
admin_route.get('/logout', auth.isLogin, auth.isAdmin, adminController.logout);
admin_route.get('/dashboard', auth.isLogin, auth.isAdmin, adminController.adminDashboard);
admin_route.get('/new-user', auth.isLogin, auth.isAdmin, adminController.newUserLoad);
admin_route.post('/new-user', auth.isLogin, auth.isAdmin, upload.single('image'), adminController.addUser);
admin_route.get('/edit-user', auth.isLogin, auth.isAdmin, adminController.editUserLoad);
admin_route.post('/edit-user', auth.isLogin, auth.isAdmin, adminController.updateUsers);
admin_route.get('/delete-user', auth.isLogin, auth.isAdmin, adminController.deleteUser);

// Catch-all route
admin_route.get('*', (req, res) => {
    res.redirect('/admin');
});



module.exports = admin_route;