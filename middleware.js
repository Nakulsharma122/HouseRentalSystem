const Listing=require('./models/listing.js');
const Review=require('./models/review.js');
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");


module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
      req.session.redirectUrl=req.originalUrl;
      req.flash('error','You must be the owner to list a property!');
      return res.redirect('/login');
    }
    next();
}

module.exports.saveRedirctUrl=(req,res,next)=> {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl= req.session.redirectUrl;
    }
  next();
}; 

module.exports.isOwner= async(req, res, next) =>{
  let { id } = req.params;
  let listing= await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash('error', 'You do not have permission to edit this listing.');
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  if(error){
    throw new  ExpressError(400,error);
  }else{
    next();
  }
}

module.exports.validatereview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if(error){
    throw new  ExpressError(400,error);
  }else{
    next();
  }
}

module.exports.isReviewAuthor= async(req, res, next) =>{
  let {id, reviewId} = req.params;
  let review= await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currentUser._id)) {
    req.flash('error', "You Don't have Permission");
    return res.redirect(`/listings/${id}`);
  }
  next();
};