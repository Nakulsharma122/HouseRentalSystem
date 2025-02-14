const User = require("../models/user.js");

const loadAuth = (req, res) => {
    res.render('users/login.ejs');
};

const successGoogleLogin = (req, res) => { 
    if (!req.user) {
        res.redirect('/failure');
    } else {
        console.log(req.user);
        req.flash("success", "WELCOME TO HOME AWAY!");
        res.redirect("/listings");
    }
};

const failureGoogleLogin = (req, res) => { 
    res.send("Error"); 
    res.redirect("/login");
    // res.render('users/login.ejs');
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            req.flash('error', 'Email already exists. Please use a different email.');
            return res.redirect('/login');
        }

        const newUser = new User({ username, email });
        await User.register(newUser, password);
        req.flash('success', 'Successfully registered! Please log in.');
        res.redirect('/login');
    } catch (err) {
        console.error("Error during registration:", err);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/login');
    }
};

module.exports = {
    loadAuth,
    successGoogleLogin,
    failureGoogleLogin,
    registerUser
};
