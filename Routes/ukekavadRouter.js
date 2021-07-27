const express = require('express');
const mongoose = require("mongoose");
const { TreeningKava, Harjutus } = require('../models/harjutus');
const router = express.Router();
const catchAsync = require("../Utils/CatchAsync");
const ExpressError = require('../Utils/ExpressError');

router.get("/", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const kavad = await TreeningKava.find().populate('harjutused.harj');
    const object = 
    {
        reqbody,
        path,
        kavad,
    }
    console.log(object);
    res.render("Üke/ukekavad", {...object})
})

router.get("/lisaharjutus/:id", async (req, res)=>{
    const reqbody = req.body;
    const path = req.path;
    const {id} = req.params;
    const kava = await TreeningKava.findById(id).populate('harjutused.harj');
    console.log(kava);
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
    console.log(id);
    const kava = req.query;
    await TreeningKava.findByIdAndDelete(id);
    res.redirect("/ukekavad")
})

router.get("/update/:id", async(req,res)=>{
    const {id} = req.params;
    const kava = await TreeningKava.findById(id);
    const object =
    {
         kava
    }
    res.render("Üke/uuendaKava", {...object})
})

router.put("/update/:id", async(req,res)=>{
    const {id} = req.params;
    const kava = await TreeningKava.findByIdAndUpdate(id, req.body);
    res.redirect('/ukekavad')
})

router.put("/lisaharjutus/:id", async (req,res) => {
    const {id} = req.params;
    const harjutus = req.body;
    console.log(harjutus);
    const harjutused = await Harjutus.find();

    await TreeningKava.findByIdAndUpdate(id, {$push:{harjutused:harjutus}},{runValidators:true, useFindAndModify:false});
    const kava = await TreeningKava.findById(id).populate('harjutused.harj');
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
    const kava = await TreeningKava.findById(kavaid);
    for(let i = 0; i < kava.harjutused.length; i++){
        if(kava.harjutused[i]._id == harjid)
        {
            kava.harjutused.splice(i,1);
        }
    }
    await kava.save();
    console.log(kava);
    res.redirect(`/ukekavad/lisaharjutus/${kavaid}`);
})

router.post("/", catchAsync(async (req,res) => {
    const sisse = req.body;
    console.log(sisse);
    const kavad = await new TreeningKava(sisse);
    kavad.save().then(res =>{console.log(res)}).catch(err => {console.log(err)});
    res.redirect("ukekavad");
}))

module.exports = router;