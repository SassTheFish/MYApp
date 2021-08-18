const express = require('express');
const TreeningKava = require('../models/ujumine');

const router = express.Router();

router.get("/:id", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
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