const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

// Utility function to hash passwords
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log("Error hashing password:", error.message);
        throw error;
    }
};

// Render the login page
const loadLogin = async (req, res) => {
    try {
        if (req.session.user_id) {
            return res.redirect('/admin/home');  // If already logged in, go to home
        }

        const message = req.session.message || '';  // Fetch any session messages
        req.session.message = null;  // Clear session messages after fetching

        res.render('login', { message });  // Pass message to the view
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page');
    }
};

// Handle user login
const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    req.session.message = "You do not have admin access.";
                    return res.redirect('/admin');
                } else {
                    req.session.user_id = userData._id;  // Set session ID for user
                    return res.redirect("/admin/home");
                }
            } else {
                req.session.message = "Email and password are incorrect.";
                return res.redirect('/admin');
            }
        } else {
            req.session.message = "Email and password are incorrect.";
            return res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
        req.session.message = "An error occurred during login.";
        return res.redirect('/admin');
    }
};

// Render the dashboard (only if logged in)
const loadDashboard = async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect('/admin');
        }
        const userData = await User.findById(req.session.user_id);
        if (!userData || userData.is_admin !== 1) {
            req.session.destroy();
            return res.redirect('/admin');
        }
        res.render('home', { admin: userData });
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page');
    }
};
// Handle logout and session destruction
const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin');
    });
};

// Render the admin dashboard with user data
const adminDashboard = async (req, res) => {
    try {
        const userData = await User.find({ is_admin: 0 });
        const message = req.session.message || '';
        req.session.message = null;

        res.render('dashboard', { users: userData, message });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin');
    }
};

// Render new user form
const newUserLoad = async (req, res) => {
    try {
        res.render('new-user');
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/dashboard');
    }
};

// Add new user
const addUser = async (req, res) => {
    try {
        const { name, email, mno } = req.body;
        const image = req.file.filename;
        const password = randomstring.generate(8);
        const spassword = await securePassword(password);

        const user = new User({
            name,
            email,
            mobile: mno,
            image,
            password: spassword,
            is_admin: 0
        });

        const userData = await user.save();
        if (userData) {
            req.session.message = 'User added successfully.';
            res.redirect('/admin/dashboard');
        } else {
            res.render('new-user', { message: 'Something went wrong while adding the user.' });
        }
    } catch (error) {
        console.log(error.message);
        res.render('new-user', { message: 'An error occurred while adding the user.' });
    }
};

// Render edit user form
const editUserLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById(id);

        if (userData) {
            res.render('edit-user', { user: userData });
        } else {
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/dashboard');
    }
};

// Update user details
const updateUsers = async (req, res) => {
    try {
        const { id, name, email, mno } = req.body;
        await User.findByIdAndUpdate(id, {
            $set: { name, email, mobile: mno }
        });

        req.session.message = 'User updated successfully.';
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
        req.session.message = 'An error occurred while updating the user.';
        res.redirect('/admin/dashboard');
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const id = req.query.id;

        if (!id) {
            req.session.message = 'User ID not provided.';
            return res.redirect('/admin/dashboard');
        }

        const result = await User.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            req.session.message = 'User not found or already deleted.';
        } else {
            req.session.message = 'User deleted successfully.';
        }

        return res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
        req.session.message = 'Error deleting user.';
        return res.redirect('/admin/dashboard');
    }
};

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser
};
