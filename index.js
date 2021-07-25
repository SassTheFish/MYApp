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
const ExpressError = require('./Utils/ExpressError');


const {c_lihasgruppid} = require('./variables');







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
const ukekavaRouter = require('./Routes/ukekavadRouter');
const ujumisekavaRouter = require('./Routes/ujumisekavaRouter');



app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(morgan('dev'));


app.use('/', homeRouter);
app.use('/ukekavad', ukekavaRouter);
app.use('/ujumisekavad', ujumisekavaRouter);


const verify = ((req,res,next)=>{
    const {password} = req.query;
    if(password === "chicken"){next();}
    res.send("NOPE")
})






//---------------GET---------------------
app.get('/testpage', (req,res)=>{
    const length = c_lihasgruppid.length;
    const half1_lg = c_lihasgruppid.slice(0,length/2);
    const half2_lg = c_lihasgruppid.slice(length/2, length);
    const object = {
        half1_lg,
        half2_lg
    }
    res.render('testsite.ejs', {...object});
})
app.post('/testpage', (req,res)=>{
    console.log(req.body);
    res.redirect('/testpage');
})
app.get("/example", (req,res)=>{
    res.render("example.ejs")
})

app.get("/harjutused", async (req, res)=>{
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



//Choose one to update


app.get("/harjutused/updateH/:id", async(req,res)=>{
    const {id} = req.params;
    const harjutus = await Harjutus.findById(id);
    const object =
    {
         harjutus,
         c_lihasgruppid
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









//---------------POST-------------------

//make one and return to harjutused
app.post("/harjutused", async (req,res) => {
    const harjutus = req.body;
    console.log(harjutus);
    const harjutus1 = await new Harjutus(harjutus);
    harjutus1.save().then(res =>{console.log(res)}).catch(err => {console.log(err)});
    res.redirect("harjutused");
})




app.use((err,req,res,next)=>{
    console.log(err);
    res.send('something went wrong')
})



app.listen(4000, ()=>{
    console.log("Listening on 4000");
})



