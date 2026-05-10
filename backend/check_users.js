require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const users = await User.find({});
  console.log('Users count:', users.length);
  for (const u of users) {
    console.log(`- ${u.email} / role: ${u.role} / premium: ${u.isPremium}`);
  }
  
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
