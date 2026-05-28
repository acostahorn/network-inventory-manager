// *** DESIGN PAGE CONTROLLERS ***

const User = require('../models/user.js');

const Product = require('../models/product.js');
const categories = ['router', 'switch', 'cable', 'access point', 'workstation', 'server', 'printer','accessory'];


const ObjectId = require('mongoose').Types.ObjectId;

const mongoose = require('mongoose');



// Background Save

module.exports.saveBackground = async (req, res) => {
    const { id } = req.params;
    const { canvasJSON } = req.body;

    // Update only the design state, NOT the status or redirect
    await User.findByIdAndUpdate(id, { designState: canvasJSON });

    // Return a simple 200 OK so the browser knows the fetch was successful
    res.status(200).send("Background save successful");
};


//Submission For Approval

module.exports.submissionForApproval = async (req, res) => {
    const { id } = req.params;
    const { canvasJSON } = req.body;

    if (!req.user._id.equals(id)) {
        req.flash('error', 'Unauthorised');
        return res.redirect('/');
    }

    // 1. Update BOTH the design and the status
    await User.findByIdAndUpdate(id, {
        designState: canvasJSON,
        designStatus: 'Pending Approval' // This triggers the admin alert
    });

    // 2. Check if this was a Fetch request or a Form submit
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(200).json({ message: "Saved" });
    }

    // 3. Redirect so the page reloads with the fresh data from MongoDB
    req.flash('success', 'Design submitted for approval!');
    res.redirect(`/users/${id}/networkDesignPage`);
};

// Connection to design page

module.exports.connectionToDesignPage = async (req, res) => {
    const user = await User.findById(req.params.id);

    // 1. Force the browser NOT to cache this page
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    // 2. Only send THIS user's data
    const savedDesign = user.designState || "{}";
    const products = await Product.find({});

    // 3. PASS 'user' TO THE TEMPLATE
    res.render('networkDesignPage', {
        name: req.user.username,
        user,             // <--- This fixes the "user is not defined" error
        products,
        savedDesign,
        categories
    });

};


// DESIGN APPROVAL


module.exports.designApproval = async (req, res) => {
    const { id } = req.params;
    const { labourCost, canvasJSON } = req.body; // Add canvasJSON here

    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/users/index');
    }

    // NEW: If the Admin sent updated design data, save it FIRST
    if (canvasJSON) {
        user.designState = canvasJSON;
        // No need to save yet, we will save at the end of the function
    }

    // Now the rest of your logic uses the UPDATED designState
    if (!user.designState || user.designState === "{}") {
        req.flash('error', 'No design data found.');
        return res.redirect(`/users/${id}`);
    }

    const savedData = JSON.parse(user.designState);
    const designItems = savedData.orders || []; // e.g. ["Cat 8 Cable", "Router"]
    const sprites = savedData.sprites || [];

    // Check if there are no items OR no sprites placed
    if (designItems.length === 0 || sprites.length === 0) {
        req.flash('error', 'The design is empty. Cannot approve.');
        return res.redirect(`/users/${id}/networkDesignPage`);
    }

    // 2. Map and Group items by name to handle quantities efficiently
    const itemCounts = {};
    designItems.forEach(name => {
        itemCounts[name] = (itemCounts[name] || 0) + 1;
    });

    // We will build a temporary new cart array
    const newCartEntries = [];

    // 3. Global Stock Validation Loop
    for (let productName in itemCounts) {
        const qtyRequested = itemCounts[productName];
        const product = await Product.findOne({ name: productName });

        // 1. SILENT SKIP OR ERROR: If product doesn't exist, don't add to cart
        if (!product) {
            console.error(`Validation Error: ${productName} not found in database.`);
            // We skip this item so it doesn't create a 'null' entry in the cart
            continue;
        }

        // 2. AGGREGATE: Total reserved by OTHER users (exclude THIS user)
        const totalReservedResult = await User.aggregate([
            { $match: { _id: { $ne: user._id } } }, // <--- CRITICAL: Exclude current user
            { $unwind: '$cart' },
            { $match: { 'cart.productId': product._id } },
            { $group: { _id: null, totalInCarts: { $sum: '$cart.quantity' } } }
        ]);

        const totalReservedByOthers = totalReservedResult.length > 0 ? totalReservedResult[0].totalInCarts : 0;

        // 3. LOGIC: Total Reserved by others + This Design <= Physical Stock
        if (totalReservedByOthers + qtyRequested > product.quantity) {
            const availableLeft = Math.max(0, product.quantity - totalReservedByOthers);
            req.flash('error', `Stock Conflict: ${productName}. Available: ${availableLeft}, Requested: ${qtyRequested}.`);
            return res.redirect(`/users/${id}`);
        }

        // 4. PUSH VALIDATED ITEM
        newCartEntries.push({
            productId: product._id,
            quantity: qtyRequested
        });
    }

    // 4. Finalize Updates
    // Combine existing cart with new design items
    user.cart.push(...newCartEntries);

    user.designStatus = 'Approved';
    user.labourCost = parseFloat(labourCost) || 0;

    await user.save();

    req.flash('success', `Design for ${user.username} approved and added to cart!`);
    res.redirect(`/users/${id}`);
};


// CLEAR DESIGN PAGE

module.exports.clearDesign = async (req, res) => {
    const { id } = req.params;
    const { clearCart } = req.body;
    const user = await User.findById(id);

    if (!user) return res.status(404).send("User not found");
    // Clear the design
    user.designState = "{}";
    if (clearCart === true) {
        user.cart = [];
    }
    user.designStatus = 'None';
    user.labourCost = 0;

    await user.save();

    // Send a 200 status back to the frontend to confirm it finished
    res.status(200).send("Design cleared.");
}






