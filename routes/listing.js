const express=require( 'express');
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing} = require('../middleware.js');
const listingController=require('../controllers/listings.js');

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
  
module.exports= router;