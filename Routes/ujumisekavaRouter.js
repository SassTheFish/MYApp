const express = require('express');
const mongoose = require("mongoose");
const UjumisKava = require('../models/ujumine');
const router = express.Router();
const ujumise_H_Validation = require('../models/validators');
const catchAsync = require("../Utils/CatchAsync");
const path  = require("path");
const ExpressError = require('../Utils/ExpressError');
const {isLoggedIn, isLoggedAdmin} = require('../middleware');

const validateUjumiseHarjutus = (req,res,next) => {
    const {error} = ujumise_H_Validation.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get("/", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.originalUrl;
    const kavad = await UjumisKava.find();
    const object =
    {
        reqbody,
        path,
        kavad,
        user: req.session.userid,
    }
    res.render("Ujumine/ujumisekavad", {...object})
})

router.get("/lisaharjutus/:id", async (req, res)=>{
    const reqbody = req.body;
    const path = req.originalUrl;
    const {id} = req.params;
    const kava = await UjumisKava.findById(id);
    const object = 
    {
        reqbody,
        path,
        kava,
        id
    }
    res.render("Ujumine/lisaharjutusujumisele", {...object})
})

router.get("/deleteOne/:id", async (req,res)=>{
    const {id} = req.params;
    await UjumisKava.findByIdAndDelete(id);
    res.redirect("/ujumisekavad")
})

router.get("/update/:id", async(req,res)=>{
    const {id} = req.params;
    const kava = await UjumisKava.findById(id);
    const object =
    {
         kava
    }
    res.render("Ujumine/uuendaKava", {...object})
})
router.put("/update/:id", async(req,res)=>{
    const {id} = req.params;
    const kava = await UjumisKava.findByIdAndUpdate(id, req.body);
    res.redirect('/ujumisekavad')
})
router.put("/lisaharjutus/:id", validateUjumiseHarjutus, async (req,res) => {
    const {id} = req.params;
    const harjutus = req.body;
    await UjumisKava.findByIdAndUpdate(id, {$push:{harjutused:harjutus}},{runValidators:true, useFindAndModify:false});
    const kava = await UjumisKava.findById(id);

    const object = {
        id,
        kava
    };
    res.render("Ujumine/lisaharjutusujumisele", {...object});
})

router.get("/lisaharjutus/:id1/delete/:id2", async(req,res)=>{
    const kavaid = req.params.id1;
    const harjid = req.params.id2;
    const kava = await UjumisKava.findById(kavaid);
    for(let i = 0; i < kava.harjutused.length; i++){
        if(kava.harjutused[i]._id == harjid)
        {
            kava.harjutused.splice(i,1);
        }
    }
    await kava.save();
    res.redirect(`/ujumisekavad/lisaharjutus/${kavaid}`);
})

router.post("/uus", catchAsync(async (req,res) => {
    const sisse = req.body;
    const kavad = await new UjumisKava(sisse);
    kavad.save().then().catch(err => {console.log(err)});
    res.redirect("/ujumisekavad");
}))
router.post("/", catchAsync(async (req,res) => {
    const sisse = req.body;
    let kavad;

    if(sisse.otsing){
        kavad = await UjumisKava.find().byName(sisse.otsing)
    }
    if(sisse.rl){
        kavad = await UjumisKava.find().sort({pingutustase: sisse.rl})
    }
    else if(sisse.otsing === '' && !sisse.rl) {
        kavad = await UjumisKava.find()
    }

    const object = {

        path:req.originalUrl,
        kavad
    }
    res.render("Ujumine/ujumisekavad", {...object});
}))






module.exports = router;