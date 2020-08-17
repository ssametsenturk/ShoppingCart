const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
var resizeImg = require('resize-img');
const fs = require('fs-extra');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;


// Get Product model
const Product = require('../models/product');
// Get Category
const Category = require('../models/category');
const database = require('../config/database');

/*
 * GET products Index /
 */
router.get('/', isAdmin ,(req, res) => {
    let count;
    const promise = Product.find().sort({sorting : 1 });
        promise.then((products) => {
            count = products.length;
            res.render('admin/products', {
                products : products,
                count : count
            });
        }); 
});

/*
 * GET a add Product
 */
router.get('/add-product', function (req, res) {
 
    let title = "";
    let desc = "";
    let price = "";

    const promise = Category.find();
    promise.then((categories) => {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    }); 
    
});

/*
 * POST add product
 */
router.post('/add-product',  (req, res) => {

    let imageFile;
    if(!req.files){ imageFile =""; }
    if(req.files){
        imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;

    
    
    const errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        const promise = Category.find();
        promise.then((categories) => {
         return res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            })
        });
        
    }
    else{
        const promise = Category.findOne({slug:slug});
        promise.then((categories) => {
            if(categories){          
            req.flash('danger','Product title exists, choose another.');
               return res.render('admin/add_category', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
                });
            }
            else{
                let price2 = parseFloat(price).toFixed(2);

                let newproduct = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });
                return newproduct;
           } }).then((newproduct) => {
                newproduct.save();
                console.log(imageFile);
                mkdirp('public/product_images/' + newproduct._id,  (err) => {
                    return console.log(err);
                });

                mkdirp('public/product_images/' + newproduct._id + '/gallery', (err) => {
                    return console.log(err);
                });

                mkdirp('public/product_images/' + newproduct._id + '/gallery/thumbs', (err) => {
                    return console.log(err);
                });

                if (imageFile != "") {
                    var productImage = req.files.image;
                    var path = 'public/product_images/' + newproduct._id + '/' + imageFile;

                    productImage.mv(path, (err) => {
                        return console.log(err);
                    });
                }

                req.flash('success', 'Product added!');
                res.redirect('/admin/products');
            }).catch((err) => {
                    console.log(err);
                }).catch((err) => {
            return console.log(err);
        });
        
        
    }
   
});



/*
 * GET edit page
 */
router.get('/edit-product/:id', isAdmin , (req, res) => {
     let errors;
     let categories;
     let promise2= Category.find();
     promise2.then((categoriess)=>{
        categories=categoriess;

     }).catch((err) => {
         console.log(err);
     })
   
    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    const promise = Product.findById(req.params.id);
        promise.then((product) => {
            let galleryDir = 'public/product_images/' + product._id + '/gallery';
            let galleryImages = null;

            fs.readdir(galleryDir, (err, files) => {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('admin/edit_product', {
                        title: product.title,
                        errors: errors,
                        desc: product.desc,
                        categories: categories,
                        category: product.category.replace(/\s+/g, '-').toLowerCase(),
                        price: parseFloat(product.price).toFixed(2),
                        image: product.image,
                        galleryImages: galleryImages,
                        id: product._id
                    });
                }
            });
        
        }).catch((err) =>{
            console.log(err);
            res.redirect('/admin/products');
        }); 
    
});

/*
 * POST edit page
 */
router.post('/edit-product/:id',  (req, res) => {

    let imageFile;
    if(!req.files){ imageFile =""; }
    if(req.files){
        imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }


    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;

    const errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        const promise = Product.findOne({slug: slug, _id: {'$ne': id}});
        promise.then((product) => {
            if(product){
                req.flash('danger', 'Product title exists, choose another.');
               return res.redirect('/admin/products/edit-product/' + id);
            }
            else{
                return id;
            }
        }).then((id) => {
            let p = Product.findById(id);
            p.then((p) =>{
                
                p.title = title;
                p.slug = slug;
                p.desc = desc;
                p.price = parseFloat(price).toFixed(2);
                p.category = category;
                if (imageFile != "") {
                    p.image = imageFile;
                }
                console.log(p)
                p.save().then(() => {

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, (err) => {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, (err) => {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        return  res.redirect('/admin/products/edit-product/' + id);

                }).catch((err)=>{
                    console.log(err);
                })
            }).catch(err => {
                console.log(err);
            })
        })

            }
  });
    
  /*
 * POST product gallery
 */
router.post('/product-gallery/:id',  (req, res) => {

    let productImage = req.files.file;
    let id = req.params.id;
    let path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    let thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path,  (err) => {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then( (buf) => {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});

/*
 * GET delete image
 */
router.get('/delete-image/:image', isAdmin , (req, res) => {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});



/*
 * GET Delete Page
 */
router.get('/delete-product/:id', isAdmin , (req, res) => {
    let id = req.params.id;
    let path = 'public/product_images/' + id;

    
    const promise=Product.findByIdAndRemove(req.params.id);
    promise.then(() => {
                 return path;
    }).then((path) => {
        fs.remove(path,  (err) => {
            if (err) {
                console.log(err);
            } else {
                Product.findByIdAndRemove(id, function (err) {
                    console.log(err);
                });
                 
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });
    }).catch((err) => {
        return console.log(err);
    })
});

// Exports
module.exports = router;