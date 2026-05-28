const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const router = express.Router();
const products = require('../controllers/products.js');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const { productSchema, userSchema } = require('../schemas.js');
const { isLoggedIn, validateObjectId, fetchPendingCount, storeReturnTo, isOwner, isAdmin, validateProduct } = require('../middleware.js');

const categories = ['router', 'switch', 'cable', 'access point', 'workstation', 'server', 'printer','accessory'];

router.use(fetchPendingCount);

// multer
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer ({storage});


//PRODUCT ROUTE

router.route('/')
    //Product Index
    .get(
        catchAsync(products.index))
    //Create new Product
    .post(
        isLoggedIn,
        isAdmin,
        upload.array('images'),
        validateProduct,
        catchAsync(products.createNewProduct));


//new product form (admin)
router.get('/new',
    isLoggedIn,
    isAdmin,
    products.newProductForm);


//edit (admin)
router.get('/:id/edit',
    isLoggedIn,
    isAdmin,
    validateObjectId,
    storeReturnTo,
    catchAsync(products.editProductForm));


router.route('/:id')
    //get product details
    .get(
        validateObjectId,
        catchAsync(products.getProductDetails)
    )
    //Update Product
    .put(isLoggedIn,
        isAdmin,
        upload.array('images'),
        validateObjectId,
        validateProduct,
        catchAsync(products.updateProduct))
    //delete Product
    .delete(
        isLoggedIn,
        isAdmin,
        validateObjectId,
        catchAsync(products.deleteProduct));

module.exports = router;


