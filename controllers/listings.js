const Listing = require("../models/listing.js");
const Booking = require('../models/booking.js');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewform= (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showlisting=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
      path:'reviews',
      populate:{
        path:'author'
      },
    })
    .populate('owner');
    if(!listing){
        req.flash('error','Cannot find that listing!');
        return res.redirect('/listings');
    }
    // Updated portion
    let totalBookings = 0;
    let bookings = [];
    if (req.user && req.user._id.equals(listing.owner._id)) {
        bookings = await Booking.find({ listing: listing._id }).populate('user').exec();
        totalBookings = bookings.length;
    }



    res.render("listings/show.ejs", { listing, totalBookings, bookings });
}

module.exports.createlisting=async (req, res,next) => {
 let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();
       
       
      let url=req.file.path;
    let filename=req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    newListing.geometry = response.body.features[0].geometry;
     let savedListing = await newListing.save();
     console.log(savedListing);
    req.flash("success","Successfully added a new listing!");
    res.redirect("/listings");
}

module.exports.editlisting=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash('error','Cannot find that listing!');
      return res.redirect('/listings');
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace('/upload','/upload/w_250');
    res.render("listings/edit.ejs", { listing,originalImageUrl });
}

module.exports.updatelisting=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success","Successfully Updated listing!");
    res.redirect(`/listings/${id}`);
}

module.exports.deletelisting=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Delete Successfully ");
    res.redirect("/listings");
}





module.exports.searchListings = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            req.flash("error", "Please enter a search query.");
            return res.redirect("/listings");
        }

        // console.log("Query parameter:", query);

        // Perform a case-insensitive search using a regular expression
        const searchResults = await Listing.find({
            $or: [
                { category: { $regex: new RegExp(query, "i") } },
                { title: { $regex: new RegExp(query, "i") } },
                { description: { $regex: new RegExp(query, "i") } },
                { location: { $regex: new RegExp(query, "i") } },
                { country: { $regex: new RegExp(query, "i") } }

            ],
        });

        // console.log("Search results:", searchResults);

        if (searchResults.length === 0) {
            req.flash("error", "No listings found matching your search query.");
            return res.redirect("/listings");
        }

        res.render("listings/search-results.ejs", { searchResults, query });
    } catch (err) {
        console.error("Error searching listings:", err);
        req.flash("error", "Error searching listings");
       return  res.redirect("/listings");
    }
};
