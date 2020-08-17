var express = require('express');
var router = express.Router();

// Get Page model
var Page = require('../models/page');

/*
 * GET /
 */
router.get('/', function (req, res) {

    const promise = Page.findOne({slug: 'home'});
        promise.then((page) => {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }).catch((err) => {
            console.log(err);
        }); 
    
});

/*
 * GET a page
 */
router.get('/:slug',  (req, res) => {

    let slug = req.params.slug;

    const promise = Page.findOne({slug: slug});
        promise.then((page) => {
            if (!page) {
                res.redirect('/');
            } else {
                res.render('index', {
                    title: page.title,
                    content: page.content
                });
            }
        }).catch((err) => {
            console.log(err);
        }); 

    
});





// Exports
module.exports = router;