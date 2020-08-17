const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get Page model
const Category = require('../models/category');
const database = require('../config/database');

/*
 * GET /
 */
router.get('/', isAdmin, (req, res) => {
    const promise = Category.find().sort({sorting : 1 });
        promise.then((categories) => {
            res.render('admin/categories', {
                categories : categories
            });
        }); 
});

/*
 * GET a add Category
 */
router.get('/add-category',  (req, res) => {

    let title = "";
   
    res.render('admin/add_category', {
        title : title,
    })
    
});

/*
 * POST add page
 */
router.post('/add-category', isAdmin, (req, res) => {

    req.checkBody('title','Title must have a value').notEmpty();
    

    let title = req.body.title;
    let slug = req.body.title.replace(/\s+/g,'-').toLowerCase();

    const errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('admin/add_category', {
            errors: errors,
            title : title,
        })
    }
    else{
        const promise = Category.findOne({slug:slug});
        promise.then((category) => {
            if(category){

            
            req.flash('danger','Category slug exist, choose another.');
               return res.render('admin/add_category', {
                    title : title,

                });
            }
            else{
                let category = new Category({
                    title : title,
                    slug : slug,
                    
                });
                return category;
           } }).then((category) => {
                category.save().then(()=> {
                    const promise2 = Category.find().sort({sorting : 1 });
                    promise2.then((categories) => {
                    req.app.locals.categories = categories;
                    req.flash('success','Category added');
                    return    res.redirect('/admin/categories');

            }).catch((err) => {
                console.log(err);
            }); 
                    });
                
                })
    }
   
});



/*
 * GET edit category
 */
router.get('/edit-category/:id',isAdmin,  (req, res) => {

    const promise = Category.findById(req.params.id);
        promise.then((category) => {
            res.render('admin/edit_category', {
                title : category.title,
                id : category._id
            })

        }).catch((err) =>{
            console.log(err);
        });; ; 
    
});

/*
 * POST edit page
 */
router.post('/edit-category/:id',  (req, res) => {

    req.checkBody('title','Title must have a value').notEmpty();
    //req.checkBody('content','Content must have a value').notEmpty();
    
    let title = req.body.title;
    let slug = req.body.title.replace(/\s+/g,'-').toLowerCase();
    let id = req.body.id;
    const errors = req.validationErrors();
    console.log(slug)
    if(errors) {
        console.log(errors);
        res.render('admin/edit_category', {
            errors: errors,
            title : title,
            id : id
        })
    }
    else{
        const promise = Category.findOne({slug:slug , _id:{'$ne':id}});
        promise.then((cat) => {
            if(cat){

            
            req.flash('danger','Page slug exists choose another.');
               return res.render('admin/add_category', {
                    title : title,
                    id : id
                });
            }
            else{          
               
                return id;
           } }).then((id) => {
                let catupdate = Category.findById(id);
                return catupdate;
            }).then((catupdate) => {
                catupdate.title=title;
                catupdate.slug=slug;
                catupdate.save().then(() => {
                    let promise2 = Category.find().sort({sorting : 1 });
                    promise2.then((categories) => {
                    req.app.locals.categories = categories;

                    req.flash('success','Page edited');
                    return res.redirect('/admin/categories/edit-category/'+catupdate._id);
                    });
                }).catch((err) => {
                    console.log(err);
                });
                
            }).catch((err) => {
                    return console.log(err);
                });       
        
    }
    
});

/*
 * GET Delete Page
 */
router.get('/delete-category/:id', isAdmin, (req, res) => {
    const promise=Category.findByIdAndRemove(req.params.id);
    promise.then(() => {
        let promise2 = Category.find().sort({sorting : 1 });
                    promise2.then((categories) => {
                    req.app.locals.categories = categories;

        req.flash('success','Category deleted');
                return res.redirect('/admin/categories/');
            }).catch((err) => {
                console.log(err);
            });
    }).catch((err) => {
        return console.log(err);
    })
});

// Exports
module.exports = router;