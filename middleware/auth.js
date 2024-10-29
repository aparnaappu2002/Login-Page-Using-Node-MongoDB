const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // User is logged in, proceed to the next middleware/route
            return next();
        } else {
            // User is not logged in, redirect to the login page
            return res.redirect('/'); // Adjust this to your login route if needed
        }
    } catch (error) {
        console.log("Error in isLogin middleware:", error.message);
        return res.status(500).send("Internal Server Error"); // Optional error response
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            // User is logged out, proceed to the next middleware/route
            return next();
        } else {
            // User is logged in, redirect to the home page
            return res.redirect('/home'); // Adjust as necessary
        }
    } catch (error) {
        console.log("Error in isLogout middleware:", error.message);
        return res.status(500).send("Internal Server Error"); // Optional error response
    }
};

// authMiddleware.js



const isUser = (req, res, next) => {
    if (req.session.user_id && req.session.is_user && !req.session.is_admin) {
        next();
    } else {
        res.redirect('/login');  // Redirect to login if not a valid user
    }
};





module.exports = {
    isLogin,
    isLogout,
    isUser
};
