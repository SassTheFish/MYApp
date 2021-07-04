const express = require("express");
const { url } = require("inspector");
const { dirname } = require("path");
const path  = require("path");
const app = express();

const methodOverride = require("method-override")
const mongoose = require("mongoose");
const morgan = require("morgan")
const ejsMate = require("ejs-mate");
const catchAsync = require("./Utils/CatchAsync");




morgan('tiny');

const {Harjutus} = require('./models/harjutus');
const {TreeningKava} = require('./models/harjutus');
// const {UjumisTreening} = require('./models/ujumistreening');

mongoose.connect('mongodb://localhost:27017/MYAPP', {useNewUrlParser:true, useUnifiedTopology:true})
    .then(()=>{
        console.log("Mongo connected");
    })
    .catch(err =>{
        console.log("Mongo Error:");
        console.log(err)
    })


const homeRouter = require('./Routes/homeRouter');
// const harjutusRouter = require('./Routes/harjutusRouter');
// const kavaRouter = require('./Routes/kavaRouter');



app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(morgan('dev'));


app.use('/', homeRouter);
// app.use('/harjutused', harjutusRouter);
// app.use('/kavad', kavaRouter);


const verify = ((req,res,next)=>{
    const {password} = req.query;
    if(password === "chicken"){next();}
    res.send("NOPE")
})

const lihasgruppid = ['Deltalihas', 'Rinnalihas','Triitseps','Biitseps','Kõhulihas','Ülaselg','Alaselg','Tuharalihas','Reie eeskülg','Reie tagakülg','Sääremarjalihas'];


//---------------GET---------------------

app.get("/example", (req,res)=>{
    res.render("example.ejs")
})

app.get("/harjutused", async (req, res)=>{
    
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
    res.render("Harjutused/harjutused", {...object})
})

//render harjutused page with all info
app.get("/ujumisekavad", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const kavad = await TreeningKava.find();
    const object =
    {
        reqbody,
        path,
        kavad,
    }
    res.render("Ujumine/ujumisekavad", {...object})
})
app.get("/ukekavad", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const kavad = await TreeningKava.find().populate('harjutused.harj');
    const object = 
    {  
        reqbody,
        path,
        kavad,
    }
    res.render("Üke/ukekavad", {...object})
})
app.get("/ukekavad/lisaharjutus/:id", async (req, res)=>{
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
app.get("/ujumisekavad/lisaharjutus/:id", async (req, res)=>{
    const reqbody = req.body;
    const path = req.path;
    const {id} = req.params;
    const kava = await TreeningKava.findById(id);
    const harjutused = await Harjutus.find();
    const object = 
    {
        reqbody,
        path,
        kava,
        id,
        harjutused
    }
    res.render("Ujumine/lisaharjutusujumisele", {...object})
})
//delete all entries !!!!!!!_______KÕIK MURDUB________!!!!!
app.get("/harjutused/deleteAll", async(req,res)=>{
    console.log("deleting...")
    await Harjutus.deleteMany({}).then(res=>{console.log("Done")}).catch(err=>{console.log(err)});
    res.redirect("../harjutused")
})

app.get("/harjutused/deleteOne/:id", async (req,res)=>{
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

app.get("/ukekavad/deleteOne/:id", async (req,res)=>{
    const {id} = req.params;
    console.log(id);
    const kava = req.query;
    await TreeningKava.findByIdAndDelete(id);
    res.redirect("/ukekavad")
})
app.get("/ujumisekavad/deleteOne/:id", async (req,res)=>{
    const {id} = req.params;
    console.log(id);
    const kava = req.query;
    await TreeningKava.findByIdAndDelete(id);
    res.redirect("/ujumisekavad")
})
//Choose one to update
app.get("/harjutused/updateK/:id", async(req,res)=>{
    const {id} = req.params;
    const kava = await TreeningKava.findById(id);
    const object =
    {
         kava
    }
    res.render("Üke/uuendaKava", {...object})
})
app.get("/harjutused/updateH/:id", async(req,res)=>{
    const {id} = req.params;
    const harjutus = await Harjutus.findById(id);
    const object =
    {
         harjutus,
         lihasgruppid
    }
    res.render("Harjutused/uuendaHarjutust", {...object})
})


app.get("/technique-guides", (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const object = 
    {
        reqbody,
        path
    }
    res.render("technique-guides.ejs", {...object})
})
app.get("/swimming-plans", verify, (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const object =
    {
        reqbody,
        path
    }
    res.render("swimming-plans.ejs", {...object})
})

//------------PUT------------------



//Update that one and return
app.put("/harjutused/updateH/:id", async (req,res)=>{
    const {id} = req.params;
    const updated = await Harjutus.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect("Harjutused/harjutused")
})
app.put("/harjutused/updateK/:id", async (req,res)=>{
    const {id} = req.params;
    const updated = await TreeningKava.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect("Üke/ukekavad")
})


app.put("/ukekavad/lisaharjutus/:id", async (req,res) => {
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

app.get("/ukekavad/lisaharjutus/:id1/delete/:id2", async(req,res)=>{
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


app.put("/ujumisekavad/lisaharjutus/:id", async (req,res) => {
    const {id} = req.params;
    const harjutus = req.body;

    const harjutused = await Harjutus.find();
    await TreeningKava.findByIdAndUpdate(id, {$push:{harjutused:harjutus}},{runValidators:true, useFindAndModify:false});
    const kava = await TreeningKava.findById(id);

    const object = {
        id,
        harjutused,
        kava
    };
    res.render("Ujumine/lisaharjutusujumisele", {...object});
})


//---------------POST-------------------

//make one and return to harjutused
app.post("/harjutused", async (req,res) => {
    const harjutus = req.body;
    console.log(harjutus);
    const harjutus1 = await new Harjutus(harjutus);
    harjutus1.save().then(res =>{console.log(res)}).catch(err => {console.log(err)});
    res.redirect("harjutused");
})
app.post("/ukekavad", catchAsync(async (req,res) => {
    const sisse = req.body;
    console.log(sisse);
    const kavad = await new TreeningKava(sisse);
    kavad.save().then(res =>{console.log(res)}).catch(err => {console.log(err)});
    res.redirect("ukekavad");
}))
app.post("/ujumisekavad", catchAsync(async (req,res) => {
    const sisse = req.body;
    console.log(sisse);
    const kavad = await new TreeningKava(sisse);
    kavad.save().then(res =>{console.log(res)}).catch(err => {console.log(err)});
    res.redirect("ujumisekavad");
}))


app.use((err,req,res,next)=>{
    console.log(err);
    res.send('something went wrong')
})



app.listen(4000, ()=>{
    console.log("Listening on 4000");
})



