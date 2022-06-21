const express = require('express')
const router = express.Router();
const {isLoggedIn, isLoggedAdmin} = require('../middleware');
const {c_spordialad} = require('../variables')
const TreeningGrupp = require('../models/treeningGrupp');
const User = require('../models/user')

router.get('/treeninggruppid', async(req,res)=>{
    const gruppid = await TreeningGrupp.find().select('_id name spordialad status');
    
    const data = {
        path:req.path,
        gruppid
    }
    res.render('TreeningGrupp/treeningGruppid.ejs', {...data})
})

router.get('/treeninggrupp/create', async (req,res)=>{

    const users = await User.find({type:{$in:["sportlane", "külaline"]}}).select('username _id');
    const data = {
        path:req.path,
        userid:"Obejct12312038123",
        c_spordialad,
        users
    }
    res.render('TreeningGrupp/tgs-create.ejs', {...data})
})

router.get('/treeninggrupp/:id', async(req,res)=>{

    const {id} = req.params
    const treeningGrupp = await TreeningGrupp.findById(id).populate('users');
  

    const treeningdate = new Date('22 Jan 2022');
    const currentDate = new Date();

    const currdate = {
        month:currentDate.toLocaleString('default', { month: 'long' }),
        day:currentDate.getDate()
    }

    console.log(currdate)
    let ujumisekavad
    let üjkekavad
    let harjutused
    if(treeningGrupp.treeningud.kavad){
        let treeningObj = treeningGrupp.treeningud.filter(obj => {
            console.log(obj.kuupäev.getDate(), treeningdate.getDate())
            return obj.kuupäev.getDate() === treeningdate.getDate() && obj.kuupäev.getMonth() === treeningdate.getMonth()
        })[0]
    
    
        let treeningindex;
        if(treeningObj){
            treeningindex = treeningGrupp.treeningud.indexOf(treeningObj);
        }else {
            treeningindex = 0
        }
    
        ujumisekavad = await Ujumine.find({'_id': {$in: treeningGrupp.treeningud[treeningindex].kavad}});
        ükekavad = await Üke.find({'_id': {$in: treeningGrupp.treeningud[treeningindex].kavad}}).populate('harjutused.harj');
        harjutused = await Harjutus.find({'_id': {$in: treeningGrupp.treeningud[treeningindex].kavad}});
    } else {
        ujumisekavad = null
        ükekavad = null
        harjutused = null
    }
    console.log(treeningGrupp)
    const data = {
        path:req.path,
        tg:treeningGrupp,
        ujumisekavad,
        ükekavad,
        harjutused
    }

    res.render('TreeningGrupp/treeningGrupp.ejs',{...data})
})

router.get('/treeninggrupp/delete/:id', async(req,res)=>{
    await TreeningGrupp.findByIdAndDelete(req.params.id)
    res.redirect('/treeninggruppid')
})





router.post('treening-gruppid', async(req,res)=>{
    res.redirect('/treening-gruppid')
})

router.post('/treeninggruppid/create', async (req,res)=>{

    const grupp = new TreeningGrupp(req.body)
    await grupp.save()
    console.log(grupp)
    res.redirect(`/treeninggrupp/${grupp._id}`)
})


module.exports = router;