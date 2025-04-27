// Create chat_db and notification_db databases
db = db.getSiblingDB('chat_db');

// Create collections in chat_db
db.createCollection('messages');
db.createCollection('conversations');

// Create indexes for messages collection
db.messages.createIndex({ "conversation_id": 1 });
db.messages.createIndex({ "sender_id": 1 });
db.messages.createIndex({ "created_at": 1 });

// Create indexes for conversations collection
db.conversations.createIndex({ "participants": 1 });
db.conversations.createIndex({ "created_at": 1 });
db.conversations.createIndex({ "last_message_at": 1 });

// Switch to notification_db
db = db.getSiblingDB('notification_db');

// Create collections in notification_db
db.createCollection('notifications');
db.createCollection('notification_preferences');

// Create indexes for notifications collection
db.notifications.createIndex({ "user_id": 1 });
db.notifications.createIndex({ "created_at": 1 });
db.notifications.createIndex({ "is_read": 1 });

// Create indexes for notification_preferences collection
db.notification_preferences.createIndex({ "user_id": 1 }, { unique: true });
