const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system")



const session = require('express-session');

const nocache = require('nocache')


const express=require("express")
const app=express()
app.use(nocache())
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // Adjust maxAge as necessary
}));





const userRoute= require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute= require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.listen(3000,function ()
{
    console.log(`Server started running http://localhost:3000`)
})