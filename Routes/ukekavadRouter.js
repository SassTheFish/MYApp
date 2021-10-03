const express = require('express');
const mongoose = require("mongoose");
const { Üke, Harjutus } = require('../models/harjutus');
const router = express.Router();
const catchAsync = require("../Utils/CatchAsync");
const ExpressError = require('../Utils/ExpressError');
const SF = require('../Utils/SortingFunctions');
const {isLoggedIn, isLoggedAdmin} = require('../middleware');

router.get("/", async (req, res)=>{

    const path = req.originalUrl;
    const kavad = await Üke.find().populate('harjutused.harj');
    const object = 
    {
        path,
        kavad,
        user: req.session.userid,
    }
    res.render("Üke/ukekavad", {...object})
})

router.get("/lisaharjutus/:id", async (req, res)=>{
    const reqbody = req.body;
    const path = req.originalUrl;
    const {id} = req.params;
    const kava = await Üke.findById(id).populate('harjutused.harj');
    const harjutused = await Harjutus.find();
    const object = 
    {
        reqbody,
        path,
        kava,
        id,
        harjutused
    }
    res.render("Üke/lisaharjutusukele", {...object})
})

router.get("/deleteOne/:id", async (req,res)=>{
    const {id} = req.params;
    const kava = req.query;
    await Üke.findByIdAndDelete(id);
    res.redirect("/ukekavad")
})

router.get("/update/:id", async(req,res)=>{
    const {id} = req.params;
    const kava = await Üke.findById(id);
    const object =
    {
         kava
    }
    res.render("Üke/uuendaKava", {...object})
})

router.put("/update/:id", async(req,res)=>{
    const {id} = req.params;
    const kava = await Üke.findByIdAndUpdate(id, req.body);
    res.redirect('/ukekavad')
})

router.put("/lisaharjutus/:id", async (req,res) => {
    const {id} = req.params;
    const harjutus = req.body;
    const harjutused = await Harjutus.find();

    await Üke.findByIdAndUpdate(id, {$push:{harjutused:harjutus}},{runValidators:true, useFindAndModify:false});
    const kava = await Üke.findById(id).populate('harjutused.harj');
    const object = {
        id,
        harjutused,
        kava
    };
    res.render("Üke/lisaharjutusukele", {...object});
})

router.get("/lisaharjutus/:id1/delete/:id2", async(req,res)=>{
    const kavaid = req.params.id1;
    const harjid = req.params.id2;
    const kava = await Üke.findById(kavaid);
    for(let i = 0; i < kava.harjutused.length; i++){
        if(kava.harjutused[i]._id == harjid)
        {
            kava.harjutused.splice(i,1);
        }
    }
    await kava.save();
    res.redirect(`/ukekavad/lisaharjutus/${kavaid}`);
})

router.post("/uus", catchAsync(async (req,res) => {
    const sisse = req.body;
    
    const kavad = await new Üke(sisse);
    kavad.save().then().catch(err => {console.log(err)});
    res.redirect("/ukekavad");
}))
router.post("/", catchAsync(async (req,res) => {
    const sisse = req.body;
    let kavad;

    if(sisse.otsing){
        kavad = await Üke.find().byName(sisse.otsing).populate('harjutused.harj') 
    }
    if(sisse.rl){
        kavad = await Üke.find().sort({raskustase: sisse.rl}).populate('harjutused.harj')
    }
    else if(sisse.otsing === '' && !sisse.rl) {
        kavad = await Üke.find().populate('harjutused.harj')
    }

    const object = {

        path:req.originalUrl,
        kavad
    }
    res.render("Üke/ukekavad", {...object});
}))

module.exports = router;