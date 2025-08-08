const express = require('express');
const router = express.Router();
const Message = require('../models/message.js');
const mongoose = require('mongoose');

// GET all conversations
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await Message.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: '$wa_id',
                    name: { $first: '$name' },
                    lastMessage: { $first: '$body' },
                    lastMessageTimestamp: { $first: '$timestamp' }
                }
            },
            { $sort: { lastMessageTimestamp: -1 } }
        ]);
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET messages for a specific conversation
router.get('/conversations/:wa_id', async (req, res) => {
    try {
        const messages = await Message.find({ wa_id: req.params.wa_id })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();
        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new message
router.post('/send', async (req, res) => {
    const { wa_id, name, body, tempId, meta_msg_id } = req.body;

    if (!wa_id || !name || !body) {
        return res.status(400).json({ message: 'Missing required fields: wa_id, name, body' });
    }

    const message = new Message({
        wa_id,
        name,
        body,
        timestamp: new Date(),
        status: 'sent',
        direction: 'outgoing',
        meta_msg_id: meta_msg_id || new mongoose.Types.ObjectId().toString(),
    });

    try {
        const newMessage = await message.save();
        res.status(201).json(newMessage); // Respond to the frontend immediately

        // Handle WebSocket events and status updates
        req.io.emit('new_message', { ...newMessage.toObject(), tempId });

        // Simulate "delivered" and "read" statuses
        setTimeout(async () => {
            try {
                const deliveredMessage = await Message.findById(newMessage._id);
                if (deliveredMessage) {
                    deliveredMessage.status = 'delivered';
                    await deliveredMessage.save();
                    req.io.emit('status_update', { id: deliveredMessage.meta_msg_id, status: 'delivered' });

                    setTimeout(async () => {
                        try {
                            const readMessage = await Message.findById(newMessage._id);
                            if (readMessage) {
                                readMessage.status = 'read';
                                await readMessage.save();
                                req.io.emit('status_update', { id: readMessage.meta_msg_id, status: 'read' });
                            }
                        } catch (e) {
                            console.error('Error updating status to read:', e);
                        }
                    }, 2000); // 2 seconds after delivered
                }
            } catch (e) {
                console.error('Error updating status to delivered:', e);
            }
        }, 1500); // 1.5 seconds after sent

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;