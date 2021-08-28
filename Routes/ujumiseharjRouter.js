const express = require('express')
const router = express.Router();



router.get('/', (req,res)=>{
    const data = {
        path:req.originalUrl
    }
    res.render('Harjutused/harjutusedU', {...data})
})



module.exports = router;