// *** PRODUCT CONTROLLERS ***

const Product = require('../models/product.js');

const ObjectId = require('mongoose').Types.ObjectId;

const categories = ['router', 'switch', 'cable', 'access point', 'workstation', 'server', 'printer','accessory'];
const {cloudinary} = require('../cloudinary');



//INDEX

module.exports.index = async (req, res, next) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category: category });
        res.render('products/index', { name: category, products })

    }
    else {
        const products = await Product.find({});
        res.render('products/index', { name: 'All Products', products })
    };
};


//NEW PRODUCT

//New Product Form

module.exports.newProductForm = (req, res) => { 
    res.render('products/new', { name: 'New Product', categories });
};

//Create New Product

module.exports.createNewProduct = async (req, res, next) => {
    const newProduct = new Product(req.body.product);
     if (req.files) {
        newProduct.images = req.files.map(f => ({
            url: f.secure_url || f.url, // Try both path and url just in case
            filename: f.filename || f.public_id || f.path
        }));
    }
    await newProduct.save();
   req.flash('success', 'successfully added a new product');
    res.redirect(`/products/${newProduct._id}`)
};


//GET PRODUCT DETAILS

module.exports.getProductDetails = async (req, res, next) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    if (!product) {

        req.flash('error','cannot find that product');
        return res.redirect('/products')
    }
    res.render('products/show', { name: product.name, product });

};


//EDIT PRODUCT

//Edit Product Form

module.exports.editProductForm = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
     if (!product) {

        req.flash('error','cannot find that product');
        return res.redirect('/products')
    }
     console.log("EDITING PRODUCT:", product);

    res.render('products/edit', { name: 'Update Product', product, categories });
}

//Update product

module.exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  //  console.log("DELETE IMAGES FROM FORM:", req.body.deleteImages);

    // 1. Update text fields AND push new images in one go
    const imgs = req.files.map(f => ({ 
        url: f.url, 
        filename: f.filename || f.public_id || f.path 
    }));

    // findByIdAndUpdate can handle the $push for you!
    const product = await Product.findByIdAndUpdate(id, { 
        ...req.body.product,
        $push: { images: { $each: imgs } } 
    }, { new: true });

    // 2. Handle Deletions
    if (req.body.deleteImages) {
        // Step A: Delete from Cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename.trim());
        }

        // Step B: Pull from MongoDB
        // We use the same 'id' and the $pull operator
        await Product.updateOne(
            { _id: id }, 
            { $pull: { images: { filename: { $in: req.body.deleteImages } } } }
        );
}
 req.flash('success', 'Successfully updated product');
    res.redirect(`/products/${product._id}`);
};


//DELETE PRODUCT

module.exports.deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    const delendum = await Product.findByIdAndDelete(id);
    req.flash ('success','Item successfully removed')
    res.redirect('/products/');
}



