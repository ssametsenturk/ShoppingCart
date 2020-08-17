const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get Page model
const Page = require('../models/page');
const database = require('../config/database');

/*
 * GET /
 */
router.get('/', isAdmin, (req, res) => {
    const promise = Page.find().sort({sorting : 1 });
        promise.then((pages) => {
            res.render('admin/pages', {
                pages : pages
            });
        }); 
});

/*
 * GET a page
 */
router.get('/add-page', isAdmin, (req, res) => {

    let title = "";
    let slug = "";
    let content = "";
   
    res.render('admin/add_page', {
        title : title,
        slug : slug,
        content : content
    })
    
});

/*
 * POST add page
 */
router.post('/add-page',  (req, res) => {

    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('content','Content must have a value').notEmpty();
    

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug == "") slug = title.replace(/\s+/g,'-').toLowerCase();
    let content = req.body.content;

    const errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('admin/add_page', {
            errors: errors,
            title : title,
            slug : slug,
            content : content
        })
    }
    else{
        const promise = Page.findOne({slug:slug});
        promise.then((page) => {
            if(page){

            
            req.flash('danger','Page slug exist, choose another.');
               return res.render('admin/add_page', {
                    title : title,
                    slug : slug,
                    content : content
                });
            }
            else{
                let page = new Page({
                    title : title,
                    slug : slug,
                    content: content,
                    sorting: 100
                    
                });
                return page;
           } }).then((page) => {
                page.save().then(()=>{
                    const promise = Page.find({}).sort({sorting: 1});
                promise.then((pages) => {
                    req.app.locals.pages = pages;
                }).catch((err) => {
                    console.log(err);
                })

                req.flash('success','Page added');
                return    res.redirect('/admin/pages');
                });
            }).catch((err) => {
                    console.log(err);
                }).catch((err) => {
            return console.log(err);
        });
        
        
    }
   
});

// Sort pages function
function sortPages(p,callback) {
    let ids = p;
    
    for(let i =0; i<ids.length; i++){
        let id = ids[i];
        let count = i+1;
        const promise = Page.findById(id);
        promise.then((page) => {
            page.sorting = count;
            page.save();
        }).then(() => {
            if (count >= ids.length) {
                callback();
            }
        }).catch((err) =>{
            console.log(err);
        }).catch((err) =>{
            console.log(err);
        });; 
    }
    
}


/*
 * POST reorder pages /
 */
router.post('/reorder-pages',  (req, res) => {
    let ids = req.body['id[]'];

    sortPages(ids, ()=>{
        const promise = Page.find({}).sort({sorting: 1});
        promise.then((pages) => {
            console.log(pages);
            req.app.locals.pages = pages;
        }).catch((err) => {
            console.log(err);
        })
    });
       
          
        
});

/*
 * GET edit page
 */
router.get('/edit-page/:id', isAdmin, (req, res) => {

    const promise = Page.findById(req.params.id);
        promise.then((page) => {
            res.render('admin/edit_page', {
                title : page.title,
                slug : page.slug,
                content : page.content,
                id : page._id
            })

        }).catch((err) =>{
            console.log(err);
        });; ; 
    
});

/*
 * POST edit page
 */
router.post('/edit-page/:id', function (req, res) {

    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('content','Content must have a value').notEmpty();
    
    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug == "") slug = title.replace(/\s+/g,'-').toLowerCase();
    let content = req.body.content;
    let id = req.body.id;
    const errors = req.validationErrors();
    console.log(slug)
    if(errors) {
        console.log(errors);
        res.render('admin/edit_page', {
            errors: errors,
            title : title,
            slug : slug,
            content : content,
            id : id
        })
    }
    else{
        const promise = Page.findOne({slug:slug , _id:{'$ne':id}});
        console.log(id);
        promise.then((page) => {
            if(page){

            
            req.flash('danger','Page slug exists choose another.');
               return res.render('admin/add_page', {
                    title : title,
                    slug : slug,
                    content : content,
                    id : id
                });
            }
            else{          
               
                return id;
           } }).then((id) => {
                let pageupdate = Page.findById(id);
                return pageupdate;
            }).then((pageupdate) => {
                pageupdate.title=title;
                pageupdate.slug=slug;
                pageupdate.content=content;
                console.log(pageupdate)
                pageupdate.save().then(() => {
                    const promise = Page.find({}).sort({sorting: 1});
                    promise.then((pages) => {
                        req.app.locals.pages = pages;
                    }).catch((err) => {
                        console.log(err);
                    })

                    console.log(pageupdate.slug);
                    req.flash('success','Page updatedy');
                    return res.redirect('/admin/pages/edit-page/'+pageupdate._id);
                });
               
            }).catch((err) => {
                    return console.log(err);
                });       
        
    }
    
});

/*
 * GET Delete Page
 */
router.get('/delete-page/:id', function (req, res) {
    const promise=Page.findByIdAndRemove(req.params.id);
    promise.then(() => {

        const promise = Page.find({}).sort({sorting: 1});
        promise.then((pages) => {
            req.app.locals.pages = pages;
        }).catch((err) => {
            console.log(err);
        })

        req.flash('success','Page deleted');
                return res.redirect('/admin/pages/');
    }).catch((err) => {
        return console.log(err);
    })
});

// Exports
module.exports = router;