const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','login first!');
        return res.redirect('/login');
    }
    next();
}


module.exports = isLoggedIn;