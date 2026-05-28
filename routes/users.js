const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const ObjectId = require('mongoose').Types.ObjectId;
const catchAsync = require('../utils/catchAsync');
const Product = require('../models/product.js');
const User = require('../models/user.js')
const { isLoggedIn, fetchPendingCount, storeReturnTo, validateObjectId, isAdmin, canAccessDesign, validateUser, isPasswordStrong } = require('../middleware.js');
const users = require('../controllers/users.js');
const designs = require('../controllers/designs.js')

const mongoose = require('mongoose');

const passport = require('passport');
const categories = ['router', 'switch', 'cable', 'access point', 'workstation', 'server', 'printer','accessory'];

router.use(fetchPendingCount);





// 1. STATIC ROUTES

// USERS INDEX (only admin can access)

router.get('/', isLoggedIn, isAdmin, catchAsync(users.index));


 
//USER REGISTER

//Register Form GET

router.get('/new', 
    users.registerForm
);

//Register New User POST
 
router.post('/register',
    validateUser, 
    isPasswordStrong,
    catchAsync(users.saveNewUser)
);


//LOGIN

router.route('/login')
// login Form
.get(
    users.loginForm
)
// login Execute
.post(
   
    passport.authenticate('local', { failureFlash: true, failureRedirect: 'login' }), 
    catchAsync(users.loginExecute)
)

// I forgot
router.route('/iForgot')
// form
.get(
    users.forgotForm
)
.post(
    catchAsync(users.handleForgotPassword)
)

// reset password
router.route('/reset-password/:token') 
.get(
    catchAsync(users.renderResetPasswordForm)
)
.post(
    isPasswordStrong,
    catchAsync(users.handlePasswordReset)
)

//LOGOUT

router.get('/logout',
    isLoggedIn,
    users.logout );

// 2. SPECIFIC SUB-PATHS

//Edit User Form GET
router.get('/:id/edit', 
    isLoggedIn, 
    isAdmin, 
    validateObjectId, 
    catchAsync(users.editUserForm)
);

//connection to network design page

router.get('/:id/networkDesignPage', 
    isLoggedIn, 
    canAccessDesign, 
    catchAsync(designs.connectionToDesignPage)
);


// checkout: only owner and admin

router.delete('/:id/checkout', 
    isLoggedIn, 
    canAccessDesign, 
    catchAsync(users.checkout));

//order products

router.post('/:id/orderproducts',
    isLoggedIn,
    catchAsync(users.orderProducts)
);


//delete product from cart
router.delete('/:id/products/:productId',
    isLoggedIn,
    canAccessDesign, 
    catchAsync(users.deleteProductFromCart)
);

//delete labour entry
router.delete('/:id/deleteLabour', 
    isLoggedIn, 
    canAccessDesign, 
    catchAsync(users.deleteLabour)
);


// *** DESIGN PAGE ROUTES ***


// Lightweight Background Save Route
router.post('/:id/design/save-background',
    isLoggedIn, 
    canAccessDesign,
    catchAsync(designs.saveBackground)
);

// Submission for approval (user)

router.post('/:id/design/save', 
    isLoggedIn,
    canAccessDesign, 
    catchAsync(designs.submissionForApproval)
);


// for approval from the admin
router.post('/:id/approve-design', 
    isLoggedIn, 
    isAdmin, 
    catchAsync(designs.designApproval)
);

//clear design page
router.post('/:id/design/clear', 
    isLoggedIn,
    canAccessDesign, 
    catchAsync(designs.clearDesign)
);

// 3. GENERAL PARAMETER ROUTES

router.route('/:id')
//GET DETAILS: only owner and admin
.get(

    storeReturnTo, 
    validateObjectId, 
    isLoggedIn, 
    canAccessDesign, 
    catchAsync(users.getDetails)
)
//Save edited user
.put(
     isLoggedIn, 
     isAdmin, 
     validateObjectId, 
     validateUser, 
     catchAsync(users.editUserSave)
)
//DELETE USER (only admin)
.delete(
    isLoggedIn, 
    canAccessDesign, 
    validateObjectId, 
    catchAsync(users.deleteUser)
);

module.exports = router;