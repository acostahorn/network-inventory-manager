const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin'); // We will create this next
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin } = require('../middleware');

// The Inbox Page
router.get('/conversations', 
    isLoggedIn, 
    isAdmin, 
    catchAsync(admin.renderInbox));

// The Individual Conversation Page
router.get('/conversations/:id', 
    isLoggedIn, 
    isAdmin, 
    catchAsync(admin.showUserChat));




module.exports = router;