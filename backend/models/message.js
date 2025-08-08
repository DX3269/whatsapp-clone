const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // The user's WhatsApp ID (phone number)
    wa_id: {
        type: String,
        required: true,
        index: true
    },
    // The user's name
    name: {
        type: String,
        required: true
    },
    // The body of the message
    body: {
        type: String,
        required: true
    },
    // Timestamp of the message
    timestamp: {
        type: Date,
        default: Date.now
    }, // <-- The comma was likely missing here
    
    // The direction of the message
    direction: {
        type: String,
        enum: ['incoming', 'outgoing'],
        required: true
    },
    // Message status (sent, delivered, or read)
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    // The unique message ID from the webhook, for status tracking
    meta_msg_id: {
        type: String,
        unique: true,
        required: true
    }
}, { timestamps: true });

const Message = mongoose.model('processed_messages', messageSchema);

module.exports = Message;