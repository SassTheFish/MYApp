const express = require('express')
const {Harjutus} = require('../models/harjutus');
const {TreeningKava} = require('../models/harjutus');
const router = express.Router();
const { c_lihasgruppid } = require('../variables');


router.get("/", async (req, res)=>{
    const length = c_lihasgruppid.length;
    const half1_lg = c_lihasgruppid.slice(0,length/2);
    const half2_lg = c_lihasgruppid.slice(length/2, length);
    const reqbody = req.body;
    const path = req.path;
    const harjutused = await Harjutus.find();
    const object =
    {
        reqbody,
        path,
        harjutused,
        c_lihasgruppid,
        half1_lg,
        half2_lg
    }
    res.render("Harjutused/harjutused", {...object})
})

router.get("/deleteOne/:id", async (req,res)=>{
    const {id} = req.params;
    const kavad = await TreeningKava.find();
    let usedharj = false;
    for(kava of kavad){
        for(harjutus of kava.harjutused)
        {
            if(harjutus.harj == id){usedharj = true}
        }
    }
    if(!usedharj)
    {
        await Harjutus.findByIdAndDelete(id).then(()=>{console.log("done")}).catch(err=>{console.log("err", err)});
    } else {
        console.log("Kava on kasutusel");
    }
    res.redirect("/harjutused")
})

router.get("/update/:id", async(req,res)=>{
    const {id} = req.params;
    const harjutus = await Harjutus.findById(id);
    const object =
    {
         harjutus,
         c_lihasgruppid
    }
    res.render("Harjutused/uuendaHarjutust", {...object})
})

//delete all entries !!!!!!!_______KÕIK MURDUB________!!!!!
router.get("/deleteAll", async(req,res)=>{
    console.log("deleting...")
    await Harjutus.deleteMany({}).then(res=>{console.log("Done")}).catch(err=>{console.log(err)});
    res.redirect("../harjutused")
})

router.put("/update/:id", async (req,res)=>{
    const {id} = req.params;
    const updated = await Harjutus.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect("/harjutused")
})

router.post("/", async (req,res) => {
    const harjutus = req.body;
    console.log(harjutus);
    const harjutus1 = await new Harjutus(harjutus);
    harjutus1.save().then(res =>{console.log(res)}).catch(err => {console.log(err)});
    res.redirect("/harjutused");
})



module.exports = router;