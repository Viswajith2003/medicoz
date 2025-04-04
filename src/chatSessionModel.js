const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    role: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },

    content: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ChatSessionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [MessageSchema],
    updatedAt: { 
        type: Date,
        default: Date.now 
    },

});

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema)


module.exports = ChatSession;
