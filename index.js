//---------EXTERNAL----------
const { url } = require("inspector");
const { dirname} = require("path");
const path = require("path")
const { object } = require("joi");

const express = require("express");
const app = express();
const session = require('express-session');
const methodOverride = require("method-override")
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');

const mongoose = require("mongoose");
const morgan = require("morgan")
const ejsMate = require("ejs-mate");




//------ MY STUFF -----------

//ERROR MANAGEMENT
const catchAsync = require("./Utils/CatchAsync");
const ExpressError = require('./Utils/ExpressError');

//VARIABLES  AND FUNCTIONS
const {c_lihasgruppid} = require('./variables');
const data = require('./Utils/SortingFunctions');
const SF = require('./Utils/SortingFunctions');


//MODELS
const { TreeningKava, Harjutus } = require('./models/harjutus');
const UjumisKava = require('./models/ujumine');



//ROUTER
const homeRouter = require('./Routes/homeRouter');
const ukekavaRouter = require('./Routes/ukekavadRouter');
const ujumisekavaRouter = require('./Routes/ujumisekavaRouter');
const harjutusteRouter = require('./Routes/harjutusRouter');
const { appendFileSync } = require("fs");



morgan('tiny');



mongoose.connect('mongodb://localhost:27017/MYAPP', {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false})
    .then(()=>{
        console.log("Mongo connected");
    })
    .catch(err =>{
        console.log("Mongo Error:");
        console.log(err)
    })





//--------------MIDDLEWARE-----------------
const sessionConfig = {
    secret: 'thisisasecret',
    resave:false,
    saveUninitialized:true,
    cookie: {
        expires:5000,
        maxAge:500000
    }
}


app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(morgan('dev'));
app.use(cookieParser('thisisasecret'));
app.use(session(sessionConfig));

app.use(flash());

app.use((req,res,next)=>{
    res.locals.messages = req.flash('info');
    next();
})


//--------------ROUTERS--------------

app.use('/', homeRouter);
app.use('/ukekavad', ukekavaRouter);
app.use('/ujumisekavad', ujumisekavaRouter);
app.use('/harjutused', harjutusteRouter);




//---------------GET---------------------
app.get('/SHOW', async (req,res)=>{
    
    const {harjutusedH, kavadU, kavadÜ} = await SF.getData();
    SF.OrderRaskus(kavadÜ);
    SF.OrderRaskus(harjutusedH);
    SF.OrderRaskus(kavadU);
    res.cookie('name', 'john', {signed:true});
    if(req.session.viewCount){
        req.session.viewCount++;
    }
    else {
        req.session.viewCount = 1;
    }

    const data = {
        harjutusedH,
        kavadU,
        kavadÜ
    }
    req.flash('info', 'Flash message');
    res.cookie('viewCount', req.session.viewCount).render("SHOW", {...data});
})


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



