//Mongoose start
const mongoose = require('mongoose');
const {Schema} = mongoose;

const imageSchema = new Schema ({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name cannot be blank'],
        lowercase: true
    },
    brand: {
        type: String,
        required: true,
        uppercase: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['router', 'switch', 'cable', 'access point', 'workstation', 'server', 'printer','accessory']
    },
    quantity: {
        type: Number,
        required: true
    },
    details: {
        type: String
    },
    images: [imageSchema],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

   
}


)

const Product = mongoose.model('Product', productSchema);
module.exports = Product;