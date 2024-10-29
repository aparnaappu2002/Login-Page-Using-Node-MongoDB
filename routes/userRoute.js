const express =require("express")
const user_route=express()
const multer = require('multer')
const path = require("path")
const bodyparser = require('body-parser')

const session = require('express-session')

const config = require('../config/config')
user_route.use(session({
    secret: config.sessionSecret,
    resave: false,  // Add this option
    saveUninitialized: false,  // Add this option
    cookie: { secure: false }  // Set to true if using HTTPS
}));


const auth = require("../middleware/auth")


user_route.set('view engine','ejs')
user_route.set('views', path.join(__dirname, '../views/users'));


user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}))

user_route.use(express.static('public'))

const storage=multer.diskStorage({
    destination:function(req,file,cb)
    {
        cb(null,path.join(__dirname,'../public/userImages'))
    },
    filename:function(req,file,cb){

        const name = Date.now()+'-'+file.originalname;
        cb(null,name)

    }
})

const upload = multer({storage:storage})

const userController = require("../controllers/userController")

function noCache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
    next();
}

user_route.use(noCache);


user_route.get('/register',auth.isLogout,userController.loadRegister)

user_route.post('/register',upload.single('image'),userController.insertUser)

user_route.get('/',auth.isLogout,userController.loginLoad)
user_route.get('/login',auth.isLogout,userController.loginLoad)

user_route.post('/login',userController.verifyLogin)

user_route.get('/home',auth.isLogin,auth.isUser,userController.loadHome)

user_route.get('/logout',auth.isLogin,userController.userLogout)

user_route.get('/edit',auth.isLogin,auth.isUser,userController.editLoad)

user_route.post('/edit',upload.single('image'),userController.updateProfile)





module.exports = user_route