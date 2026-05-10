const mongoose = require('mongoose');
require('dotenv').config();

console.log('URI:', process.env.MONGODB_URI);
console.log('Trying to connect...');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
})
.then(() => {
  console.log('CONNECTED');
  process.exit(0);
})
.catch(err => {
  console.log('ERROR:', err.message);
  process.exit(1);
});
