const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','login first!');
        return res.redirect('/login');
    }
    next();
}
const isLoggedAdmin = (req,res,next)=>{
    if(process.env.AVALIK !== "true"){
        if(req.user){
            if(req.user["type"] === "admin" | req.user["type"] === "treener"){
                next();
            }
        }
        else {
            req.flash('error','No Access')
            return res.redirect(`/login`)
        }
    }
    else {
        next();
    }
}


module.exports = {isLoggedIn,isLoggedAdmin};