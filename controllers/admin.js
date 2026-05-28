const Conversation = require('../models/conversation.js');
const User = require('../models/user.js');

module.exports.renderInbox = async (req, res) => {

    const allConversations = await Conversation.find({})
        .populate('userId', 'username email')
        .sort({ status: 1, updateAt: -1 });

    res.render('admin/inbox', {
        name: 'Admin Command Centre',
        allConversations
    })
}

module.exports.showUserChat = async (req, res) => {

    const { id } = req.params;

    const conversation = await Conversation.findOne({ userId: id })
        .populate('userId');

    if (!conversation) {
        return res.redirect('admin/inbox');
    };

    if (conversation.status === 'waiting_for_admin') {
        conversation.status = 'in_progress';
        conversation.isPaused = true;
        await conversation.save();
        await User.findByIdAndUpdate(id, { hasChatRequest: false });

    }

    res.render('admin/showChat', {
        conversation, name: `Chat with ${conversation.userId.username}`
    });
};

