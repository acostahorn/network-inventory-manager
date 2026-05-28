
//Mongoose start
const mongoose = require('mongoose');
const {Schema} = mongoose;

const conversationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isPaused: { 
        type: Boolean, default: false 
    },
    subject: {
        type: String
    },
    messages: [
        {
            sender: { type: String, enum: ['user', 'admin', 'bot'] },
            text: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    status: { 
        type: String, 
        enum: ['active', 'waiting_for_admin', 'in_progress', 'fulfilled'], 
        default: 'active' 
    }

},
{
    timestamps: true
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;