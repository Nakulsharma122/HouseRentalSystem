const User=require("../models/user.js");

module.exports.renderSignForm=(req,res)=>{
    res.render('users/signup.ejs');
}

module.exports.signup=async(req, res) => {
    try{
        let {username,email,password}= req.body;
        newUser = new User({ username , email });
        const registerUser=await User.register(newUser,password);
        console.log(registerUser);
        req.logIn(registerUser,function(err){
            if(err){
                return next(err);
            }
            req.flash( "success","Account created successfully!");
            res.redirect("/listings");
        });
        
    }catch(err){
        req.flash('error',err.message);
        res.redirect( "/login" );
    }
}
module.exports.renderLoginForm=(req,res)=>{
    res.render('users/login.ejs');
}

module.exports.login=async (req, res) => {
    req.flash('success', 'Welcome back!');
    let redirectUrl = (res.locals.redirectUrl || '/listings');
    res.redirect(redirectUrl);
}

module.exports.logout=(req,res)=> {
    req.logout((err)=>{
      if(err){
          return next(err);
      }
      req.flash('success','Logged out') ;
      res.redirect('/listings');
    }) ;
}