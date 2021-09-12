const express = require('express');
const UjumisKava = require('../models/ujumine');
const {Üke, Harjutus} = require('../models/harjutus');
const isLoggedIn = require('../middleware')


const router = express.Router();

router.get("/:id/:type", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.originalUrl;
    let kava;
    switch(req.params.type){
        case 'ujumine':
            kava = await UjumisKava.findById(req.params.id);
            break;
        case 'üke':
            kava = await Üke.findById(req.params.id);
            break;
        case 'harjutus':
            kava = await Harjutus.findById(req.params.id);
    }

    const object = 
    {
        reqbody,
        path,
        user: req.session.userid,
        kava,
        type: req.params.type
    }
    res.render("showcard.ejs", {...object})
})


module.exports = router;