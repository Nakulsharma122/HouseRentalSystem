const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../passport');

const userController = require('../controllers/userController');

router.use(passport.initialize());
router.use(passport.session());

router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.successGoogleLogin);

router.get('/failure', userController.failureGoogleLogin);


router.post('/auth/login', userController.registerUser);

module.exports = router;
