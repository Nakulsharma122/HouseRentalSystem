const express=require( 'express');
const router=express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const {saveRedirctUrl,isLoggedIn}=require("../middleware.js")
const userController=require('../controllers/users.js');
const Booking = require('../models/booking.js');


router
.route('/signup')
.get(userController.renderSignForm)
.post(wrapAsync (userController.signup));

router
.route('/login')
.get(userController.renderLoginForm)
.post( saveRedirctUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userController.login);

router.get('/logout',userController.logout);




// Show user bookings
router.get('/bookings', isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate('listing');
    res.render('users/bookings', { bookings });
});

// Handle booking deletion
router.delete('/bookings/:id', isLoggedIn, async (req, res) => {
    await Booking.findByIdAndDelete(req.params.id);
    req.flash('success', 'Booking successfully cancelled.');
    res.redirect('/bookings');
});


module.exports=router;