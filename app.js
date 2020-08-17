const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');

const app = express();

//connect to db
mongoose.connect('mongodb+srv://testuser:user123@cluster0.xmnd5.mongodb.net/shoppingcart?retryWrites=true&w=majority');
const db = mongoose.connection;
db.once('open',() => {
    console.log('connected to MongoDB');
})


//View engine setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//set global errors variable
app.locals.errors = null;

// Get Page Model
const Page = require('./models/page');
app.locals.pages;
// Get all pages to pass to header.ejs
const promise = Page.find().sort({sorting : 1 });
        promise.then((pages) => {
           app.locals.pages = pages;
           //console.log(pages);
        }).catch((err) => {
            console.log(err);
        }); 

// Get Category Model
const Category = require('./models/category');
app.locals.categories;
// Get all categories to pass to header.ejs
const promise2 = Category.find().sort({sorting : 1 });
        promise2.then((categories) => {
           app.locals.categories = categories;
           //console.log(pages);
        }).catch((err) => {
            console.log(err);
        }); 

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

// Express fileUpload middleware
app.use(fileUpload())

//body parser middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:false }))
//parse application/json
app.use(bodyParser.json())

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
   // cookie: { secure: true }
  }));

//express validator middleware

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Passport Config
require('./config/passport')(passport);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*', (req,res,next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
})

//Set routes
const products = require('./routes/products');
const pages = require('./routes/pages');
const cart = require('./routes/cart');
const users = require('./routes/users');
const adminPages = require('./routes/admin_pages');
const adminCategories = require('./routes/admin_categories');
const adminProducts = require('./routes/admin_products');

app.use('/products',products);
app.use('/cart',cart);
app.use('/users',users);
app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);
app.use('/',pages);

//start server
const port = 3000;
app.listen(port,() => {
 console.log('server start');
})