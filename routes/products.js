const express = require('express');
const router = express.Router();
var fs = require('fs-extra');
const auth = require('../config/auth');
const isUser = auth.isUser;

// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

/*
 * GET all products
 */
router.get('/', isUser, (req, res) => {
    //router.get('/', isUser, function (req, res) {
    
        const promise = Product.find();
        promise.then((products) => {
            res.render('all_products', {
                title: 'All products',
                products: products
            });
        }).catch((err) => {
            console.log(err);
        }); 

    
    });  

/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    let categorySlug = req.params.category;

    const promise = Category.findOne({slug: categorySlug});
        promise.then((category) => {
            if(category){
                Product.find({category: categorySlug}).then((products) => {
                    res.render('cat_products', {
                        title: category.title,
                        products: products
                    });
                })
            }
            else{
                req.flash('danger','Category not found');
                return res.redirect('/products');
            }
        }).catch((err) => {
            console.log(err);
        }); 


});


/*
 * GET product details
 */
router.get('/:category/:product',  (req, res) => {

    let galleryImages = null;
    let loggedIn =  (req.isAuthenticated()) ? true :false;

   const promise = Product.findOne({slug: req.params.product});
        promise.then((product) => {
            if(product){
                let galleryDir = 'public/product_images/' + product._id + '/gallery';
                fs.readdir(galleryDir,  (err, files) => {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;
    
                        res.render('product', {
                            title: product.title,
                            p: product,
                            galleryImages: galleryImages,
                            loggedIn: loggedIn
                        });
                    }
                });
                
            }
            else{
                req.flash('danger','Product not found');
                return res.redirect('/products');
            }
        }).catch((err) => {
            console.log(err);
        }); 


});

// Exports
module.exports = router;