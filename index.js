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

const lihasgruppid = ['jalad', 'kere', 'käed'];


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
    res.render("harjutused", {...object})
})

//render harjutused page with all info
app.get("/kavad", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const kavad = await TreeningKava.find();
    const object = 
    {  
        reqbody,
        path,
        kavad,
    }
    res.render("kavad", {...object})
})
app.get("/kavad/lisaharjutus/:id", async (req, res)=>{
    const reqbody = req.body;
    const path = req.path;
    const {id} = req.params;
    const kava = await TreeningKava.find();
    const harjutused = await Harjutus.find();
    const object = 
    {
        reqbody,
        path,
        kava,
        id,
        harjutused
    }
    console.log(kava.harjutused)
    res.render("lisaharjutus", {...object})
})
//delete all entries
app.get("/harjutused/deleteAll", async(req,res)=>{
    console.log("deleting...")
    await Harjutus.deleteMany({}).then(res=>{console.log("Done")}).catch(err=>{console.log(err)});
    res.redirect("../harjutused")
})

app.get("/harjutused/deleteOne/:id", async (req,res)=>{
    const {id} = req.params;
    console.log(id);
    const kava = req.query;
    await Harjutus.findByIdAndDelete(id);
    res.redirect("/harjutused")
})
app.get("/kavad/deleteOne/:id", async (req,res)=>{
    const {id} = req.params;
    console.log(id);
    const kava = req.query;
    await TreeningKava.findByIdAndDelete(id);
    res.redirect("/kavad")
})
//Choose one to update
app.get("/harjutused/updateK/:id", async(req,res)=>{
    const {id} = req.params;
    const kava = await TreeningKava.findById(id);
    const object =
    {
         kava
    }
    res.render("uuendaKava", {...object})
})
app.get("/harjutused/updateH/:id", async(req,res)=>{
    const {id} = req.params;
    const harjutus = await Harjutus.findById(id);
    console.log(harjutus)
    const object =
    {
         harjutus,
         lihasgruppid
    }
    res.render("uuendaHarjutust", {...object})
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


//Update that one and return to harjutused
app.put("/harjutused/updateH/:id", async (req,res)=>{
    const {id} = req.params;
    const updated = await Harjutus.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect("/harjutused")
})
app.put("/harjutused/updateK/:id", async (req,res)=>{
    const {id} = req.params;
    const updated = await TreeningKava.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect("/kavad")
})
app.put("/kavad/lisaharjutus/:id", async (req,res) => {
    const {id} = req.params;
    const harjutus = req.body;
    console.log(harjutus);
    const harjutused = await Harjutus.find();
    const object = {
        id,
        harjutused
    };
    await TreeningKava.findByIdAndUpdate(id, {$push:{harjutused:harjutus}},{runValidators:true, useFindAndModify:false});
    res.render("lisaharjutus", {...object});
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
app.post("/kavad", catchAsync(async (req,res) => {
    const sisse = req.body;
    console.log(sisse);
    const kavad = await new TreeningKava(sisse);
    kavad.save().then(res =>{console.log(res)}).catch(err => {console.log(err)});
    res.redirect("kavad");
}))


app.use((err,req,res,next)=>{
    console.log(err);
    res.send('something went wrong')
})



app.listen(4000, ()=>{
    console.log("Listening on 4000");
})



