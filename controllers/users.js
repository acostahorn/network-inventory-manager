// *** USER CONTROLLERS ***

const User = require('../models/user.js');

const Product = require('../models/product.js');

const Conversation = require('../models/conversation.js');

const ObjectId = require('mongoose').Types.ObjectId;

const crypto = require('crypto');

const nodemailer = require('nodemailer')

const mongoose = require('mongoose');






//USERS INDEX (ADMIN ONLY)

module.exports.index = async (req, res) => {
    const allUsers = await User.find({});
    const waitingConversations = await Conversation.find({ status: 'waiting_for_admin' });
    // Create a simple list of User IDs who are waiting
    const waitingIds = waitingConversations.map(conv => conv.userId.toString());
    const users = allUsers.map(user => {
        // Convert Mongoose document to a plain JS object so we can add properties
        const userObj = user.toObject();

        // If this user's ID is in our "waiting" list, mark them true
        userObj.hasChatRequest = waitingIds.includes(user._id.toString());

        return userObj;
    });

    res.render('users/index', { name: 'All Users', users });
};

//USERS SIGNUP

//Signup Form GET

module.exports.registerForm = (req, res) => {
    res.render('users/new', { name: 'add new user' });
};

//Save New User POST

module.exports.saveNewUser = async (req, res, next) => {

    if (!req.body) throw new ExpressError('Invalid Item Data', 400);
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username, role: 'user' });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", username + ", Welcome to AAA");
            const redirectUrl = '/'
            res.redirect(redirectUrl);
        });
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/')
    }
};

//LOGIN

// Login Form GET

module.exports.loginForm = (req, res) => {
    res.render('users/login', { name: 'Login' });
};

// Login Execute POST

module.exports.loginExecute = async (req, res) => {
    req.flash('success', req.body.username + ', welcome back to our e-shop!');
    const user = await User.findOne({ username: req.body.username });
    const redirectUrl = `/users/${user._id.toString()}`
    res.redirect(redirectUrl);
};

//LOGOUT

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye');

        res.redirect('/');
    });
};

//GET DETAILS - Including Cart

module.exports.getDetails = async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id).populate({
        path: 'cart.productId',
        model: 'Product' // Ensure this matches your Product model name
    });
    if (!user) {
        req.flash('error', 'cannot find that user');
        return res.redirect('/users')
    }
    res.render('users/show', { name: user.username, user });

};

// forgot form

module.exports.forgotForm = (req, res) => {
    res.render('users/iForgot', { name: 'iForgot' });
};

// forgot redirect

module.exports.handleForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Find the user by the submitted email
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('success', "If that email exists, a reset link has been sent.");
            return res.redirect('/users/iForgot');
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds
        await user.save();
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // auto-generated ephemeral user
                pass: testAccount.pass, // auto-generated ephemeral password
            },
        });
        const resetUrl = `https://aaavnetwork.vercel.app/users/reset-password/${resetToken}`;

        const mailOptions = {
            from: '"AAA Team" <noreply@AANetworkSolutions.com>',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h3>You requested a password reset</h3>
                <p>Please click on the link below to complete the process. This link is valid for 1 hour:</p>
                <a href="${resetUrl}" target="_blank">${resetUrl}</a>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("====================================================");
        console.log("📧 RESET EMAIL SENT TO ETHEREAL TEST SERVER!");
        console.log("👉 Click this link to see the email inbox preview:");
        console.log(nodemailer.getTestMessageUrl(info));
        console.log("====================================================");



let successMessage = "If that email exists, a reset link has been sent.";

if (process.env.NODE_ENV === 'development') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    // 💡 Added the closing '>' right after the style quotes!
    successMessage += `<br><br><a href="${previewUrl}" target="_blank" style="font-weight: bold; color: #0f5132;">[Dev Mode Only] Open Test Mailbox ✉️</a>`;
}

req.flash('success', successMessage);
return res.redirect('/users/iForgot');

    }
    catch (error) {
        console.error("Forgot Password Error:", error);
        req.flash("error", "Internal server error processing request.");
        return res.redirect('/users/iForgot');

    }
}

// reset password form
module.exports.renderResetPasswordForm = async (req, res) => {
    try {
        // Find a user who has this exact token AND check that the expiration date is in the future
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() } // $gt means "Greater Than"
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/users/iForgot');
        }

        // Token is valid! Render your password update page and pass the token to the template
        return res.render('users/reset-password', { name: "reset form", token: req.params.token });

    } catch (error) {
        console.error("GET Reset Password Error:", error);
        req.flash('error', 'An error occurred loading the reset page.');
        return res.redirect('/users/iForgot');
    }

}

// reset logic 

module.exports.handlePasswordReset = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    try {
        // 1. Basic validation check
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect(`/users/reset-password/${token}`);
        }

        // 2. Re-verify the user still exists and token hasn't expired in the last few minutes
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/users/iForgot');
        }

        // 3. Update the password
        // 💡 NOTE: If you are using passport-local-mongoose, use user.setPassword()
        // If you are using standard bcrypt, hash it manually: user.password = await bcrypt.hash(password, 10);
        await user.setPassword(password);

        // 4. Clear out the token fields so they become useless now
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // 5. Success! Send them to login cleanly
        req.flash('success', 'Your password has been successfully updated! You can now log in.');
        return res.redirect('/users/login'); // Change this to your actual login route path

    } catch (error) {
        console.error("POST Reset Password Error:", error);
        req.flash('error', 'Internal server error processing password reset.');
        return res.redirect(`/users/reset-password/${token}`);
    }
};






//EDIT USER

//Edit User Form GET

module.exports.editUserForm = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {

        req.flash('error', 'cannot find that user');
        return res.redirect('/users')
    }
    res.render('users/edit', { name: 'Update User', user });
};

//Edit User Save POST

module.exports.editUserSave = async (req, res, next) => {

    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body.user, { runValidators: true, new: true });
    if (!user) {

        req.flash('error', 'cannot find that user');
        return res.redirect('/users')
    }
    req.flash('success', 'user successfully edited');
    res.redirect(`/users/${user._id}`)

};


//DELETE USER

module.exports.deleteUser = async (req, res, next) => {
    const { id } = req.params;

    // 1. Find user and their cart
    const user = await User.findById(id);

    // 2. If they have an 'Approved' design (meaning items are in cart)
    // you must logically "release" those items.
    if (user && user.designStatus === 'Approved' && user.cart.length > 0) {
        // Logic: Since your 'designApproval' subtracts from potential 
        // availability via the $match filter, deleting the user 
        // automatically frees up that reservation. 
        // However, if your 'checkout' subtracts from REAL physical stock,
        // you only need to worry if the user checked out.
        console.log(`User ${user.username} deleted. Reserving cart items released.`);
    }

    // 3. Delete the user
    await User.findByIdAndDelete(id);

    // Remember to update your global counts here if you are 
    // decrementing physical stock outside of checkout.

    req.flash('success', 'Successfully deleted user');
    res.redirect('/users/');
};



// *** CART ROUTES ***

//CHECKOUT

module.exports.checkout = async (req, res) => {
    const { id } = req.params;

    // 1. Explicitly populate so we have the product data to verify
    const user = await User.findById(id).populate('cart.productId');

    if (!user || user.cart.length === 0) {
        req.flash('error', 'Your cart is empty!');
        return res.redirect(`/users/${id}`);
    }

    // 2. Prepare updates and handle potential ID casting issues
    const productUpdates = user.cart.map(item => {
        // Handle both populated and unpopulated productId
        const pId = item.productId._id || item.productId;

        return {
            updateOne: {
                // Ensure we use a real Mongoose ObjectId for the filter
                filter: {
                    _id: new mongoose.Types.ObjectId(pId),
                    quantity: { $gte: item.quantity }
                },
                update: { $inc: { quantity: -item.quantity } }
            }
        };
    });


    // Stock Validation to be executed before bulkWrite
    let stockErrors = [];

    for (let item of user.cart) {
        // Populate was used, so we access ._id
        const p = await Product.findById(item.productId._id);
        const productName = p ? p.name : "Unknown Product";
        if (!p) {
            stockErrors.push(`Product ID ${item.productId._id} not found in database.`);
        } else if (p.quantity < item.quantity) {
            // Use 'productName' here
            stockErrors.push(`${productName}: Only ${p.quantity} left, but you have ${item.quantity} in cart.`);
        }
    }


    // If anything failed, STOP and tell the user
    if (stockErrors.length > 0) {
        // For a standard Express app, we use flash and redirect
        req.flash('error', stockErrors.join(' | '));
        return res.redirect(`/users/${id}`);
    }


    // 3. Execute bulkWrite
    let result;
    try {
        result = await Product.bulkWrite(productUpdates);
    } catch (err) {
        console.error("BulkWrite Error:", err);
        req.flash('error', 'A database error occurred during checkout. Please try again.');
        return res.redirect(`/users/${id}`);
    }
    console.log('modified count: ' + result.modifiedCount);


    if (result.modifiedCount < user.cart.length) {
        // If this hits, it means the filter { quantity: { $gte: item.quantity } } failed.
        // It means between 'Approval' and 'Checkout', the stock actually dropped.
        req.flash('error', 'One or more items in your approved design are now out of stock.');
        return res.redirect(`/users/${id}`);
    }

    // 4. Success Logic
    const transaction = JSON.parse(JSON.stringify(user.cart)); // Clone for the invoice
    const finalLabour = user.labourCost;

    user.cart = [];
    user.labourCost = 0;
    user.designStatus = 'None';
    await user.save();

    req.flash('success', 'Checkout complete!');
    res.render('users/showTransaction', {
        name: user.username,
        transaction,
        labourCost: finalLabour
    });
};

//ORDER PRODUCTS

module.exports.orderProducts = async (req, res) => {
    const { productId, quantityToAdd = 1 } = req.body;
    const qtyRequested = Number(quantityToAdd);
    const currentUser = req.user;

    // 1. Fetch the product to see the actual "Hard Stock"
    const product = await Product.findById(productId);
    if (!product) {
        req.flash('error', 'Product not found');
        return res.redirect(`/users/${currentUser._id}`); // Use currentUser since you defined it above
    }
    // 2. Aggregate total quantity of this product across ALL users' carts
    const totalReservedResult = await User.aggregate([
        { $unwind: '$cart' }, // Flatten the cart arrays into individual documents
        { $match: { 'cart.productId': new mongoose.Types.ObjectId(productId) } }, // Find only this product
        { $group: { _id: null, totalInCarts: { $sum: '$cart.quantity' } } } // Sum the quantities
    ]);

    // If no one has it in their cart, the result is 0
    const totalInCarts = totalReservedResult.length > 0 ? totalReservedResult[0].totalInCarts : 0;

    // 3. Logic Check: Total in carts + what user wants vs. Product stock
    if (totalInCarts + qtyRequested > product.quantity) {
        const availableLeft = Math.max(0, product.quantity - totalInCarts);
        req.flash('error', `Stock limit reached. Only ${availableLeft} more available globally across all carts.`);
        return res.redirect(`/users/${req.user._id}`);
    }

    // 4. Update Current User's Cart
    const cartItemIndex = currentUser.cart.findIndex(item =>
        item.productId.equals(productId)
    );

    if (cartItemIndex > -1) {
        // Product exists: update the quantity
        currentUser.cart[cartItemIndex].quantity += qtyRequested;
    } else {
        // Product doesn't exist: push a new item object matching your schema
        currentUser.cart.push({ productId, quantity: qtyRequested });
    }

    await currentUser.save();

    req.flash('success', 'Product added to cart');
    res.redirect(`/users/${currentUser._id}`);
};

// DELETE PRODUCT FROM CART

module.exports.deleteProductFromCart = async (req, res, next) => {
    const { id, productId } = req.params;
    const user = await User.findById(id);
    user.cart.pull({ productId: productId });

    await user.save();
    req.flash('success', 'successfully deleted from cart, returned to stock');
    res.redirect(`/users/${id}`);
};

// DELETE LABOUR COST

module.exports.deleteLabour = async (req, res) => {

    const { id } = req.params;
    const user = await User.findById(id);
    user.labourCost = 0;
    await user.save();
    return res.redirect(`/users/${id}`);

};

















