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
const TreeningGrupp = require('./models/treeningGrupp');



//ROUTER
const homeRouter = require('./Routes/homeRouter');
const Ük_kavaRouter = require('./Routes/ukekavadRouter');
const U_kavaRouter = require('./Routes/ujumisekavaRouter');
const Ük_harjRouter = require('./Routes/harjutusRouter');
const showcardRouter = require('./Routes/showcardRouter');
const userRouter = require('./Routes/userRouter');
const U_harjRouter = require('./Routes/ujumiseharjRouter');








//----------CONNECT DATABASE---------------------
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
//------------------------------------------------





const {isLoggedIn, isLoggedAdmin} = require('./middleware');


const store = new MongoDBStore({
    mongoUrl:database_url,
    touchAfter: 24 * 3600
})


store.on("error", function(e){
    console.log("Session store error", e);
})

//Hello git

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

//--------------MIDDLEWARE-----------------

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
app.use('/ukekavad', Ük_kavaRouter);
app.use('/ujumisekavad', U_kavaRouter);
app.use('/harjutused', Ük_harjRouter);
app.use('/ujumiseharj', U_harjRouter);
app.use('/showcard', showcardRouter);
app.use('/', userRouter);





const exampleData = {
    nimi:"Kava",
    harjutused:[{nimi:"harjutus",raskustase:4, lihasgruppid:["kõhulihased"],kirjeldus:"puudub"}],
    raskustase:10,
    harj:{
        nimi:"asdasdas",
        raskustase:2,
        lihasgruppid:["säärealihas"],
        kordused_x:1,
        kordused_y:2
    }
}





//---------------GET---------------------
app.get('/treening-gruppid', (req,res)=>{

    const data = {
        path:req.path,
        harjutused:exampleData
    }
    res.render('treeningGruppid.ejs',{...data})
})


app.get('/testpage', isLoggedAdmin, (req,res)=>{
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
    let ükekavad = await Üke.find({'_id': {$in: ids}}).populate('harjutused.harj');
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


app.post('/minapage/updateUser/:userid', async (req,res,next)=>{

    let updateData = {}
    if(req.body.nimi !== ''){
        updateData.name = req.body.nimi
    }
    if(req.body.email !== ''){
        updateData.email = req.body.email
    }
    if(req.body.roll !== ''){
        updateData.type = req.body.roll
    }
    const user = await User.findByIdAndUpdate(req.params.userid, updateData, {runValidators:true, new:true}).catch(()=>{
        req.flash('error', 'ei ole sellist rolli')
    });
    console.log(user)
    res.redirect('/minapage')
})


app.post('/save/:id', async(req,res)=>{
    if(!req.user){
        req.flash('error', 'Logi enne sisse');
        res.redirect('back');
    } else {
        const user = await User.findById(req.user._id)
        if(!user.saved.includes(req.params.id)){
            user.saved.push(req.params.id);
            user.save();
            req.flash('success', 'saved');
            res.redirect('back')
        }
        else {
            req.flash('error', 'already saved');
            res.redirect('back');
        }
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



//............LAST CALL.................
app.use((err,req,res,next)=>{
    const object = {
        err
    }
    res.render("ERROR", {...object});
})

//---------------PORT---------------------
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Listening on ${port}`);
})



