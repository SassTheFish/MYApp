//---------EXTERNAL----------

if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


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

const MongoDBStore = require("connect-mongo");

const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrat = require('passport-local');


//------ MY STUFF -----------

//ERROR MANAGEMENT
const catchAsync = require("./Utils/CatchAsync");
const ExpressError = require('./Utils/ExpressError');

//VARIABLES  AND FUNCTIONS
const {c_lihasgruppid} = require('./variables');
const data = require('./Utils/SortingFunctions');
const SF = require('./Utils/SortingFunctions');


//MODELS
const { Üke, Harjutus } = require('./models/harjutus');
const Ujumine = require('./models/ujumine');
const User = require('./models/user');


//ROUTER
const homeRouter = require('./Routes/homeRouter');
const ukekavaRouter = require('./Routes/ukekavadRouter');
const ujumisekavaRouter = require('./Routes/ujumisekavaRouter');
const harjutusteRouter = require('./Routes/harjutusRouter');
const showcardRouter = require('./Routes/showcardRouter');
const userRouter = require('./Routes/userRouter');

const { appendFileSync } = require("fs");




morgan('tiny');

const hashPassword = async (pw)=>{
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(pw, salt)
}

hashPassword('monkey');




const database_url_d = 'mongodb://localhost:27017/MYAPP';
const database_url_p = process.env.DB_URL; 
const database_url = database_url_p || database_url_d;
mongoose.connect(database_url, 
    {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true, 
    useFindAndModify:false
    })
    .then(()=>{
        console.log("Mongo connected");
    })
    .catch(err =>{
        console.log("Mongo Error:");
        console.log(err)
    })






//--------------MIDDLEWARE-----------------

const isLoggedIn = require('./middleware');


const store = new MongoDBStore({
    mongoUrl:database_url,
    touchAfter: 24 * 3600
})


store.on("error", function(e){
    console.log("Session store error", e);
})


const Secret = process.env.SECRET || 'thisisasecret'

const sessionConfig = {
    secret: Secret,
    resave:true,
    saveUninitialized:true,
    cookie: {
        maxAge:1000* 60 * 60 * 24 * 10 // 10 days
    },
    store
}

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(morgan('dev'));
app.use(cookieParser(Secret));
app.use(session(sessionConfig));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrat(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(flash());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.info = req.flash('info');
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//--------------ROUTERS--------------

app.use('/', homeRouter);
app.use('/ukekavad', ukekavaRouter);
app.use('/ujumisekavad', ujumisekavaRouter);
app.use('/harjutused', harjutusteRouter);
app.use('/showcard', showcardRouter);
app.use('/', userRouter);







app.get('/secret', isLoggedIn,(req,res)=>{
    res.render('secret')
})



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
        kavadÜ,
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
        half2_lg,
        
    }
    res.render('testsite.ejs', {...object});
})
app.post('/testpage', (req,res)=>{
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
app.get("/minapage", isLoggedIn, async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const ids = req.user.saved;
    let ujumisekavad = await Ujumine.find({'_id': {$in: ids}});
    let ükekavad = await Üke.find({'_id': {$in: ids}});
    let harjutused = await Harjutus.find({'_id': {$in: ids}});

    const object = 
    {
        reqbody,
        path,
        ujumisekavad,
        ükekavad,
        harjutused
    }
    res.render("minapage.ejs", {...object })
})

app.post('/save/:id', async(req,res)=>{
    console.log(req.user)
    console.log(req.params.id)

    const user = await User.findById(req.user._id)
    if(!user.saved.includes(req.params.id)){
        user.saved.push(req.params.id);
    }
    else {
        req.flash('error', 'already saved');
        res.redirect('/harjutused');
    }
    
    user.save();
    req.flash('success', 'saved');
    res.redirect('/harjutused');
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


const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Listening on ${port}`);
})



