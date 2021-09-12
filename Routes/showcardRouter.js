const express = require('express');
const TreeningKava = require('../models/ujumine');
const isLoggedIn = require('../middleware')


const router = express.Router();

router.get("/:id/:type", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.originalUrl;
    const kava = await TreeningKava.findById(req.params.id); 
    const object = 
    {
        reqbody,
        path,
        user: req.session.userid,
        kava
    }
    res.render("showcard.ejs", {...object})
})


module.exports = router;