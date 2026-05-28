
const Conversation = require('../models/conversation.js');
const User = require('../models/user.js');
const { getBotResponse } = require('../utils/botHelper')


module.exports.conversationPost = async (req, res) => {
    const { id } = req.params; // This is the ID from the URL
    const { text } = req.body;

    // 1. Look for the conversation using the schema key 'userId'
    let conversation = await Conversation.findOne({ userId: id });

    // 2. If it doesn't exist, create it with the 'userId' key
    if (!conversation) {
        conversation = new Conversation({
            userId: id, // <--- THIS MUST MATCH THE SCHEMA
            messages: []
        });
    };


    conversation.messages.push({ sender: 'user', text });

    if (!conversation.isPaused) {

        // 3. Get AI response and push messages if it has not been paused by admin
        const user = await User.findById(id);
        const aiResponse = await getBotResponse(user.designState, text);


        conversation.messages.push({ sender: 'bot', text: aiResponse });
    }


    // 4. Save 
    await conversation.save();

    res.json(conversation);
}


// admin reply

module.exports.adminReply = async (req, res) => {
    const { id } = req.params; // The user's ID
    const { text } = req.body;

    let conversation = await Conversation.findOne({ userId: id });

    if (conversation) {
        conversation.messages.push({
            sender: 'admin',
            text: text,
            timestamp: new Date()
        });

        // Optional: Keep it paused while admin is talking
        conversation.isPaused = true;
        conversation.status = 'in_progress';

        await conversation.save();
        res.json(conversation.messages);
    } else {
        res.status(404).send("Conversation not found");
    }
};


// Get all conversations (admin) - commented out, not in use
// module.exports.getAllConversations = async (req, res) => {
//     try {
//         // We populate 'username' and 'email' from your User schema
//         // We also sort by the last message timestamp to keep active chats at the top
//         const conversations = await Conversation.find()
//             .populate('userId', 'username email designStatus')
//             .sort({ 'messages.timestamp': -1 });

//         // --- THE LOG ---
//         console.log("--- ADMIN LOG: FETCHING ALL CONVERSATIONS ---");
//         conversations.forEach(conv => {
//             console.log(`User: ${conv.userId?.username || 'Unknown'} (${conv.userId?.email})`);
//             console.log(`Message Count: ${conv.messages.length}`);
//             if (conv.messages.length > 0) {
//                 const lastMsg = conv.messages[conv.messages.length - 1];
//                 console.log(`Last Message: [${lastMsg.sender}] ${lastMsg.text}`);
//             }
//             console.log("-------------------------------------------")
//         });

//         res.status(200).json(conversations);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching conversations", error: error.message });
//     }
// };


// get help

module.exports.getHelp = async (req, res) => {

    console.log('getHelp');
    const { id } = req.params;



    // Use findOne with the userId key from your Schema
    let conversation = await Conversation.findOne({ userId: id });

    // Safety Check: If no conversation exists yet, create one
    if (!conversation) {
        conversation = new Conversation({
            userId: id,
            messages: [],
            isPaused: false
        });
    };

    conversation.status = "waiting_for_admin";

    // Add the notification message
    conversation.messages.push({
        sender: 'bot',
        text: "I've notified an admin. You can keep on chatting with me until they come"
    });

    await conversation.save();
    
    res.json({ status: conversation.status, message: 'An admin will be with you shortly, you can keep on chatting with me until they come' });
}


// reactivate bot
module.exports.reactivateBot = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Find the conversation
        const conversation = await Conversation.findOne({ userId: id });

        if (conversation) {
            // 2. Flip the switch
            conversation.isPaused = false;

            // 3. Add the notification message
            // We use 'bot' or 'admin' as the sender so it styles correctly in your UI
            conversation.messages.push({
                sender: 'bot',
                text: "--- Chat with admin has ended. The chatbot is now active. ---",
                timestamp: new Date()
            });


            // 4. Save the changes
            await conversation.save();
        }

        // 5. Back to the admin dashboard
        res.redirect('/users');
    } catch (e) {
        console.error("Error reactivating bot:", e);
        res.redirect('/users');
    }
};

module.exports.acknowledgeRequest = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Update Conversation status to 'active' (subtracts from pendingCount)
        await Conversation.findOneAndUpdate(
            { userId: id },
            { status: 'active' }
        );

        // 2. Update User to remove the badge
        await User.findByIdAndUpdate(id, { hasChatRequest: false });

        // 3. Redirect back to the dashboard to see the updated table/count
        res.redirect('/users');
    } catch (e) {
        console.error("Error acknowledging request:", e);
        res.redirect('/users');
    }
};

module.exports.endChat = async (req, res) => {
    const { id } = req.params;

    try {
        const conversation = await Conversation.findOne(
            { userId: id },);
        if (conversation) {
            conversation.isPaused = false;
            conversation.status = 'fulfilled'; // Or 'active' depending on your bot logic

            // Optional: Add a system message so the user knows the bot is back
            conversation.messages.push({
                sender: 'admin',
                text: "--- Admin has left the chat. The bot is now active. ---",
                timestamp: new Date()
            });

            await conversation.save();
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ error: "Conversation not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

module.exports.status = async (req, res) => {
    try {
        // Look up the conversation by the ID passed in the URL (the user's ID)
        const conversation = await Conversation.findOne({ userId: req.params.id });
        
        if (!conversation) {
            return res.json({ messages: [], status: 'not_found' });
        }
        
        // Return the full conversation object (including the messages array)
        res.json(conversation);
    } catch (e) {
        console.error("Admin status fetch error: ", e);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports.myStatus = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ userId: req.user._id })
        if (!conversation) {
            return res.json({ messages: [], status: 'new' });
        }
        res.json(conversation);
    }
    catch (e) {
        console.error("Error fetching status: ", e);
        res.status(500).json({ error: "Server error" });

    }
};


module.exports.clearConversation = async (req, res) => {
    const { id } = req.params; // This is the userId

    // Find the conversation for this user and set messages to an empty array
    const result = await Conversation.findOneAndUpdate(
        { userId: id }, 
        { $set: { messages: [] } }, 
        { new: true }
    );

    if (!result) {
        return res.status(404).json({ status: 'error', message: 'Conversation not found' });
    }

    res.status(200).json({ status: 'success', message: 'Messages cleared' });
};
