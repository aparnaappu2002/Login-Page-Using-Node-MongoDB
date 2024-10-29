const  User = require('../models/userModel')

const isAdmin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const user = await User.findById(req.session.user_id);
            if (user.is_admin == 1) {
                next();
               
            } else {
                return res.redirect('/admin');
            }
        } else {
            return res.redirect('/admin'); 

            
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin');
    }
};

const isUser=async (req,res,next) => {
    try {
        if(req.session.user_id){
            const user=await User.findById(req.session.user_id);
            if(user.is_admin==0){
                next()

            }
            else{
                return res.redirect('/admin/home')
            }
        }
        else{
            return res.redirect('/')
        }
        
    } catch (error) {
        console.log(error);
    }
}


const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){
        }else{
            return res.redirect('/admin')
        }
        next();
    } catch (error) {
        console.log(error.message)  
    }
}



const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            return res.redirect('/admin/home');
        }
        next()
    } catch (error) {
        console.log(error.message)  
    }   
}

module.exports ={
    isLogin,
    isLogout,
    isUser,
    isAdmin
}