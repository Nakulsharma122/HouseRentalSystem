const express=require( 'express');
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,validatereview,isReviewAuthor}=require("../middleware.js");
const reviewController=require('../controllers/reviews.js');


// Review ---->Post
 router.post('/',isLoggedIn,validatereview,wrapAsync(reviewController.createReview));
  
//  Review --> Update & Delete
  
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports=router;