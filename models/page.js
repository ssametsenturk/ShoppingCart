const mongoose = require('mongoose');

// Page Schema
const PageSchema = mongoose.Schema({
   
    title: {
        type: String,
        required: [true,"Title must have a value."]
    },
    slug: {
        type: String
        
    },
    content: {
        type: String,
        required: [true,"Content must have a value."]
    },
    sorting: {
        type: Number
    }
    
});

var Page = module.exports = mongoose.model('Page', PageSchema);