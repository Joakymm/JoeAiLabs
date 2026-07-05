/**
 * Migration script to add social fields to existing users.
 * Run: node data/migrate-social.js
 * Safe to run multiple times (idempotent).
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;
  const users = db.collection('users');
  const postsCollection = db.collection('posts');
  const followRequestsCollection = db.collection('followrequests');
  const notificationsCollection = db.collection('notifications');
  const conversationsCollection = db.collection('conversations');
  const messagesCollection = db.collection('messages');

  // 1. Add social fields to existing users
  const userResult = await users.updateMany(
    {},
    {
      $set: {
        coverPhoto: '',
        isPrivate: false,
        skills: [],
        followers: [],
        following: [],
        pendingFollowRequests: [],
        badges: [],
        stats: { postsCount: 0, coursesCompleted: 0 },
      },
    }
  );
  console.log(`✅ Updated ${userResult.modifiedCount} users with social fields`);

  // 2. Create indexes for new collections
  await postsCollection.createIndexes([
    { key: { author: 1, createdAt: -1 } },
    { key: { createdAt: -1 } },
    { key: { isAchievement: 1, createdAt: -1 } },
  ]);
  console.log('✅ Posts indexes created');

  await followRequestsCollection.createIndexes([
    { key: { from: 1, to: 1 }, unique: true },
    { key: { to: 1, status: 1 } },
  ]);
  console.log('✅ FollowRequest indexes created');

  await notificationsCollection.createIndexes([
    { key: { recipient: 1, read: 1, createdAt: -1 } },
  ]);
  console.log('✅ Notification indexes created');

  await conversationsCollection.createIndexes([
    { key: { participants: 1 } },
    { key: { updatedAt: -1 } },
  ]);
  console.log('✅ Conversation indexes created');

  await messagesCollection.createIndexes([
    { key: { conversationId: 1, sentAt: -1 } },
  ]);
  console.log('✅ Message indexes created');

  // 3. Create new collections if they don't exist
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  const needed = ['posts', 'followrequests', 'notifications', 'conversations', 'messages'];
  for (const name of needed) {
    if (!collectionNames.includes(name)) {
      await db.createCollection(name);
      console.log(`✅ Created collection: ${name}`);
    }
  }

  console.log('\n🎉 Migration complete! All social fields added safely.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
