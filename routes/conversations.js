const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const conversations = require('../controllers/conversations.js');
const passport = require('passport');
const User = require('../models/user');
const { isLoggedIn, fetchPendingCount, storeReturnTo, isOwner, isAdmin, validateProduct, canAccessDesign } = require('../middleware.js');
const Conversation = require('../models/conversation.js');

router.use(fetchPendingCount);

// POST /conversations/:id/request-help
router.post('/:id/request-help',
    isLoggedIn, 
    catchAsync(conversations.getHelp));

//reactivate bot
router.patch('/:id/reactivateBot', 
    isLoggedIn,
    catchAsync(conversations.reactivateBot));


//end chat
router.post('/:id/end-chat', 
    isLoggedIn, 
    isAdmin, 
    catchAsync(conversations.endChat));

//admin intervention
router.post('/:id/admin-reply', 
    isLoggedIn, 
    isAdmin, 
    catchAsync(conversations.adminReply));

//acknowledge request

router.patch('/:id/acknowledge', 
    isLoggedIn, 
    isAdmin, 
    catchAsync(conversations.acknowledgeRequest));

// New route specifically for the Admin to peek into a specific user's chat
router.get('/:id/status', isLoggedIn, 
    catchAsync(conversations.status));


// clear conversation chat
router.post('/:id/clear', 
    isLoggedIn, 
    catchAsync(conversations.clearConversation))

// routes/conversations.js (design area)
router.post('/:id', 
    isLoggedIn, 
    canAccessDesign, 
    catchAsync(conversations.conversationPost));

router.get('/my-status', 
    isLoggedIn, 
    catchAsync(conversations.myStatus));




module.exports = router;