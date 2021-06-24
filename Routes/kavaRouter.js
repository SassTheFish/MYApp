const express = require('express')
const {TreeningKava} = require('../models/harjutus');
const router = express.Router();

router.get("/kavad", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const kavad = await TreeningKava.find();
    const object = 
    {  
        reqbody,
        path,
        kavad,
    }
    res.render("kavad", {...object})
})

module.exports = router;