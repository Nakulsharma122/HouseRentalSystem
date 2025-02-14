const express=require( 'express');
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing} = require('../middleware.js');
const listingController=require('../controllers/listings.js');
const Listing = require("../models/listing.js");
const Booking = require('../models/booking.js');

const multer  = require('multer');
const {storage}=require('../CloudConfig.js');
const upload = multer({storage});

// home listing Create
router
.route('/')
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createlisting));

// Add a new route for search
router.get("/search", wrapAsync(listingController.searchListings));


//New Route
router.get("/new",isLoggedIn,listingController.renderNewform);

// show Update Delete request
router
.route('/:id')
.get(wrapAsync(listingController.showlisting))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updatelisting))
.delete(isLoggedIn,isOwner,  wrapAsync(listingController.deletelisting));

//Edit Route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.editlisting));
  
// Show booking form
router.get('/:id/book', isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const bookings = await Booking.find({ listing: listing._id });

    // Extract booked dates
    const bookedDates = bookings.map(booking => ({
        checkIn: booking.checkIn.toISOString().split('T')[0],
        checkOut: booking.checkOut.toISOString().split('T')[0]
    }));

    res.render('listings/book', { listing, bookedDates });
});

// Handle booking submission
// router.post('/:id/book', isLoggedIn, async (req, res) => {
//     const listing = await Listing.findById(req.params.id);
//     const { checkIn, checkOut } = req.body;

//     // Check for overlapping bookings
//     const existingBookings = await Booking.find({
//         listing: listing._id,
//         $or: [
//             { checkIn: { $lte: checkOut, $gte: checkIn } },
//             { checkOut: { $lte: checkOut, $gte: checkIn } }
//         ]
//     });
   
// Updated 

// Handle booking submission
router.post('/:id/book', isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const { checkIn, checkOut } = req.body;

    const today = new Date().setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn).setHours(0, 0, 0, 0);
    const checkOutDate = new Date(checkOut).setHours(0, 0, 0, 0);

    if (checkInDate < today || checkOutDate < today) {
        req.flash('error', 'Cannot book for past dates');
        return res.redirect(`/listings/${listing._id}/book`);
    }

    if (checkInDate >= checkOutDate) {
        req.flash('error', 'Check-Out date must be after Check-In date');
        return res.redirect(`/listings/${listing._id}/book`);
    }

    // Check for overlapping bookings
    const existingBookings = await Booking.find({
        listing: listing._id,
        $or: [
            { checkIn: { $lte: checkOut, $gte: checkIn } },
            { checkOut: { $lte: checkOut, $gte: checkIn } }
        ]
    });


    if (existingBookings.length > 0) {
        req.flash('error', 'The selected dates are not available.');
        return res.redirect(`/listings/${listing._id}/book`);
    }

    // Calculate total price
    const days = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    const totalPrice = days * listing.price;

    const booking = new Booking({
        user: req.user._id,
        listing: listing._id,
        checkIn,
        checkOut,
        totalPrice
    });

    await booking.save();
    req.flash('success', `Successfully booked from ${checkIn} to ${checkOut}`);
    res.redirect(`/listings/${listing._id}`);
});



module.exports= router;