const express = require('express')

const router = express.Router();

router.get("/", (req, res)=>{
    
    const reqbody = req.body;
    const path = req.originalUrl;
    const object = 
    {
        reqbody,
        path,
        user: req.session.userid,
    }
    res.render("home.ejs", {...object})
})


module.exports = router;