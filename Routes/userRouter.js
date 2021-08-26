const express = require('express');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');

router.get('/login', (req,res)=>{
    res.render('login');
})

router.post('/logout', (req,res)=>{
    req.logout();
    req.flash('info', 'logged out')
    res.redirect("/");
})

router.post('/login', passport.authenticate('local',{failureFlash:true, failureRedirect:'login'}), async(req,res)=>{
    req.flash('success', 'Logged in');
    const returnURL = req.session.returnTo;
    delete req.session.returnTo;
    res.redirect( returnURL || "/")
})

router.get('/register', (req,res)=>{
    res.render('register')
})

router.post('/register', async (req,res,next)=>{
    const {username, password} = req.body;
    if(!username | username === '' | !password | password === ''){
        req.flash('error', 'empty fields!');
        res.redirect('/register');    
    }
    const newUser = await User.register(new User({username:username}), password);
    req.login(newUser, err=>{
        if(err) return next(err);
        req.flash('success', 'Registered')
        res.redirect("/");
    });
    
})


module.exports = router;