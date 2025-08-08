const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Message = require('./models/message.js');
require('dotenv').config();

const payloadsDir = path.join(__dirname, 'sample_payloads');

const seedDatabase = async () => {
    console.log('--- Seeding script started ---');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connection successful.');

        await Message.deleteMany({});
        console.log('🗑️  Previous messages cleared.');

        const files = fs.readdirSync(payloadsDir);
        console.log(`📂 Found ${files.length} payload files to process.`);

        for (const file of files) {
            // Moved the try/catch block inside the loop to prevent stopping on one error
            try {
                const filePath = path.join(payloadsDir, file);
                const payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                
                const value = payload.metaData?.entry?.[0]?.changes?.[0]?.value;

                if (!value) continue; // Skip if the payload structure is unexpected

                if (value.messages) {
                    const messageData = value.messages[0];
                    const contactData = value.contacts[0];
                    
                    // --- New logic to determine message direction ---
                    const direction = messageData.from === contactData.wa_id ? 'incoming' : 'outgoing';

                    const newMessage = new Message({
                        wa_id: contactData.wa_id,
                        name: contactData.profile.name,
                        body: messageData.text.body,
                        timestamp: new Date(parseInt(messageData.timestamp) * 1000),
                        meta_msg_id: messageData.id,
                        direction: direction // Save the new direction field
                    });
                    await newMessage.save();
                    console.log(`✉️   Inserted ${direction} message from ${contactData.profile.name}`);

                } else if (value.statuses) {
                    const statusData = value.statuses[0];
                    await Message.updateOne(
                        { meta_msg_id: statusData.id },
                        { $set: { status: statusData.status } }
                    );
                    console.log(`🔄 Updated status to "${statusData.status}"`);
                }
            } catch (error) {
                // This will now only catch an error for a single file and continue
                if (error.code === 11000) {
                    console.warn(`⚠️  Skipped a duplicate message.`);
                } else {
                    console.error(`❌ Error processing file ${file}:`, error);
                }
            }
        }

        console.log('\n✅ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ A critical error occurred during the seeding process:', error);
    } finally {
        await mongoose.connection.close();
        console.log('--- Seeding script finished ---');
    }
};

seedDatabase();