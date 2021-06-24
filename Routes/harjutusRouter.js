const express = require('express')
const {Harjutus} = require('../models/harjutus');

const router = express.Router();

const lihasgruppid = ['jalad', 'kere', 'käed'];


router.get("/harjutused", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const harjutused = await Harjutus.find();
    const object = 
    {
        reqbody,
        path,
        harjutused,
        lihasgruppid
    }
    res.render("harjutused", {...object})
})


module.exports = router;