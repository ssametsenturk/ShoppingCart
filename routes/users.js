const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Get Users model
const User = require('../models/user');

/*
 * GET register
 */
router.get('/register',  (req, res) => {

    res.render('register', {
        title: 'Register'
    });

});

/*
 * POST register
 */
router.post('/register', function (req, res) {

    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        const promise = User.findOne({username: username});
        promise.then((user) => {
            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            } else {
                let user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10,  (err, salt) => {
                    bcrypt.hash(user.password, salt,  (err, hash) => {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save().then(() => {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login')
                            }).catch(console.log(err));
                        });
                    });
            }
        })
    }

});

/*
 * GET login
 */
router.get('/login', function (req, res) {

    if (res.locals.user) res.redirect('/'); 
    
    res.render('login', {
        title: 'Log in'
    });

});

/*
 * POST login
 */
router.post('/login',  (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    
});

/*
 * GET logout
 */
router.get('/logout',  (req, res) => {

    req.logout();
    
    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');

});

// Exports
module.exports = router;
