const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Function to hash passwords securely
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log("Error hashing password:", error.message);
        throw error; // Rethrow to handle it in the calling function
    }
};

// Load the registration page
const loadRegister = async (req, res) => {
    try {
        const message = req.query.message; // Get message from query
        res.render('registration', { message }); // Pass message to EJS
    } catch (error) {
        console.log("Error loading registration page:", error.message);
        res.render('error', { message: "Error loading registration page" });
    }
};

// Insert a new user into the database
const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
            password: spassword,
            is_admin: 0
        });

        const userData = await user.save();

        if (userData) {
            // Redirect with success message
            return res.redirect('/register?message=Registration successful!');
        } else {
            // Redirect with failure message
            return res.redirect('/register?message=Registration failed!');
        }
    } catch (error) {
        console.log("Error inserting user:", error.message);
        return res.redirect('/register?message=Error occurred during registration');
    }
};

// Load the login page
const loginLoad = async (req, res) => {
    try {
        const message = req.query.message; // Get message from query
        res.render('login', { message }); // Pass message to EJS
    } catch (error) {
        console.log("Error loading login page:", error.message);
        res.render('error', { message: "Error loading login page" });
    }
};

// Verify user login credentials
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email: email });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                if (user.is_admin) {
                    // Admin login attempt as a user
                    return res.redirect('/login?message=Incorrect email or password');
                } else {
                    // Set session details for regular user
                    req.session.user_id = user._id;
                    req.session.is_user = true;
                    req.session.is_admin = false;

                    // Redirect to the home page
                    return res.redirect('/home');
                }
            } else {
                // Password doesn't match, redirect with message
                return res.redirect('/login?message=Incorrect email or password');
            }
        } else {
            // User not found, redirect with message
            return res.redirect('/login?message=Incorrect email or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


// Load the home page for logged-in users
const loadHome = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });
        res.render('home', { user: userData });
    } catch (error) {
        console.log("Error loading home page:", error.message);
        res.render('error', { message: "Error loading home page" });
    }
};

// User logout
const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
};

// Load edit profile page
const editLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        if (userData) {
            res.render('edit', { user: userData });
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
        };

        if (req.file) {
            updateData.image = req.file.filename; // Update image only if a new one is uploaded
        }

        await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: updateData });
        res.redirect('/home');
    } catch (error) {
        console.log(error.message);
    }
}

const contact = async(req,res)=>
{
    res.send("Welcome to contact")
}

module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    editLoad,
    updateProfile,
    contact
};
