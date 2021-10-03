const express = require('express')
const router = express.Router();
const {isLoggedIn, isLoggedAdmin} = require('../middleware');


router.get('/', (req,res)=>{
    const data = {
        path:req.originalUrl
    }
    res.render('Harjutused/harjutusedU', {...data})
})



module.exports = router;