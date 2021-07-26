//---------EXTERNAL----------
const { url } = require("inspector");
const { dirname} = require("path");
const path = require("path")
const { object } = require("joi");

const express = require("express");
const app = express();
const methodOverride = require("method-override")

const mongoose = require("mongoose");
const morgan = require("morgan")
const ejsMate = require("ejs-mate");



//------ MY STUFF -----------

//ERROR MANAGEMENT
const catchAsync = require("./Utils/CatchAsync");
const ExpressError = require('./Utils/ExpressError');

//VARIABLES
const {c_lihasgruppid} = require('./variables');

//MODELS



//ROUTER
const homeRouter = require('./Routes/homeRouter');
const ukekavaRouter = require('./Routes/ukekavadRouter');
const ujumisekavaRouter = require('./Routes/ujumisekavaRouter');
const harjutusteRouter = require('./Routes/harjutusRouter');




morgan('tiny');



mongoose.connect('mongodb://localhost:27017/MYAPP', {useNewUrlParser:true, useUnifiedTopology:true})
    .then(()=>{
        console.log("Mongo connected");
    })
    .catch(err =>{
        console.log("Mongo Error:");
        console.log(err)
    })





//--------------MIDDLEWARE-----------------

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(morgan('dev'));


//--------------ROUTERS--------------

app.use('/', homeRouter);
app.use('/ukekavad', ukekavaRouter);
app.use('/ujumisekavad', ujumisekavaRouter);
app.use('/harjutused', harjutusteRouter);




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
app.get("/swimming-plans", (req, res)=>{
    
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

//?
app.put("/harjutused/updateK/:id", async (req,res)=>{
    const {id} = req.params;
    const updated = await TreeningKava.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect("Üke/ukekavad")
})





//---------------POST-------------------











//--------------------------------------
//LAST CALL
app.use((err,req,res,next)=>{
    const object = {
        err
    }
    res.render("ERROR", {...object});
})



app.listen(4000, ()=>{
    console.log("Listening on 4000");
})



