const ExpressError = require('./utils/ExpressError.js');
const { productSchema, userSchema } = require('./schemas');
const Conversation = require('./models/conversation');
const Product = require('./models/product.js')
const ObjectId = require('mongoose').Types.ObjectId;

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in!');
        return res.redirect('/');
    }
    next();
}

module.exports.isPasswordStrong = (req, res, next) => {
    const { password } = req.body;
    // Regex: 8+ chars, 1 Uppercase, 1 Lowercase, 1 Number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!password || !strongRegex.test(password)) {
        req.flash('error', 'Password must be at least 8 characters, with an uppercase, lowercase, and a number.');
        
        // SMART ROUTING CHECK:
        // If the URL contains a token, send them right back to their active reset page
        if (req.params.token) {
            return res.redirect(`/users/reset-password/${req.params.token}`);
        }
        
        // Otherwise, default back to your registration page
        return res.redirect('/users/new'); 
    }
    
    next(); // Valid password! Move to the next function in the stack
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}



module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product.owner.equals(req.user.id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/products/${id}`);
    }
    next();

}

// Ensure only Admins can change Design Status or Labour Costs
module.exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect('/products');
    }
    next();
};

// Ensure a user can only see/edit THEIR OWN design, but Admins can see ALL
module.exports.canAccessDesign = async (req, res, next) => {
    // Check both potential param names to be safe
    const id = req.params.userId || req.params.id;

    if (req.user.role === 'admin' || req.user._id.equals(id)) {
        return next();
    }
    req.flash('error', 'Unauthorised access.');
    return res.redirect('/');
};

module.exports.validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!(ObjectId.isValid(id))) {
        req.flash('error', 'invalid id');
        let fallback = '/products';
        if (req.originalUrl.includes('/users')) fallback = '/users';
        const redirectUrl = res.locals.returnTo || fallback;
        return res.redirect(redirectUrl);

    }
    next();
}

module.exports.fetchPendingCount = async (req,res,next) => {
    try {
        if (req.user && req.user.role === 'admin') {
            res.locals.pendingCount = await Conversation.countDocuments({
                status: 'waiting_for_admin'});

            } else {
                res.locals.pendingCount = 0;
            }
            next();

        } catch (e) {
            console.error ("Unable to fetch pending count: ", e);
            res.locals.pendingCount = 0;
            next();
    }
}

module.exports.validateUser = (req, res, next) => {
    const dataToValidate = req.body.user ? req.body.user : req.body;
const { error } = userSchema.validate(dataToValidate);
    
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
 
    else {
        next();
    }
}

