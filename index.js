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
const User = require('./models/user');


//ROUTER
const homeRouter = require('./Routes/homeRouter');
const ukekavaRouter = require('./Routes/ukekavadRouter');
const ujumisekavaRouter = require('./Routes/ujumisekavaRouter');
const harjutusteRouter = require('./Routes/harjutusRouter');
const showcardRouter = require('./Routes/showcardRouter');
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

app.use(flash());

app.use((req,res,next)=>{
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





app.get('/login', (req,res)=>{
    res.render('login');
})
app.post('/logout', (req,res)=>{
    req.session.userid = null;
    req.flash('info', 'logged out')
    res.redirect("/");
})
app.post('/login', async(req,res)=>{
    const {username, password} = req.body;
    if(!username | username === '' | !password | password === ''){
        req.flash('error', 'empty fields!');
        res.redirect('/login');    
    }
    const user = await User.findOne({username});
    if(!user){
        req.flash('error', 'Incorrecto')
        res.redirect('login')
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if(validPassword){
        req.flash('success', 'Logged in');
        req.session.userid = user._id;
        res.redirect('/');
    }
    else {
        req.flash('error', 'Incorrecto')
        res.redirect('/login')
    }
})


app.get('/secret', (req,res)=>{
    res.render('secret')
})
app.get('/register', (req,res)=>{

    res.render('register')
})


app.post('/register', async (req,res)=>{
    const {username, password} = req.body;
    if(!username | username === '' | !password | password === ''){
        req.flash('error', 'empty fields!');
        res.redirect('/register');    
    }
    const hash = await bcrypt.hash(password, 12);
    
    const user = new User({
        username, 
        password:hash
    })
    await user.save()
    req.session.userid = user._id;
    res.redirect('/');
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
        user: req.session.userid,
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
        user: req.session.userid,
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
        user: req.session.userid,
        reqbody,
        path
    }
    res.render("technique-guides.ejs", {...object})
})
app.get("/swimming-plans", async (req, res)=>{
    
    const reqbody = req.body;
    const path = req.path;
    const userid = req.session.userid;
    const user = await User.findById(userid);
    const ujumisekavad = await UjumisKava.find();
    const ükekavad = await TreeningKava.find().populate('harjutused.harj');
    const harjutused = await Harjutus.find();
    const object =
    {
        reqbody,
        path,
        user: req.session.userid,
        ujumisekavad,
        ükekavad,
        harjutused,
    }
    if(req.session.userid){
        res.render("swimming-plans.ejs", {...object })
    }
    else{
        req.flash('info', 'not logged in')
        res.redirect('/')
    }
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



