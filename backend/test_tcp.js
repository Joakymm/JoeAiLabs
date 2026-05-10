const mongoose = require('mongoose');
const net = require('net');

// First test raw TCP connection
console.log('Testing TCP connection to 127.0.0.1:27017...');
const sock = net.connect(27017, '127.0.0.1', () => {
  console.log('TCP connected!');
  sock.end();
  process.exit(0);
});
sock.on('error', (err) => {
  console.log('TCP error:', err.message);
  process.exit(1);
});
sock.setTimeout(3000);
sock.on('timeout', () => {
  console.log('TCP timeout');
  process.exit(1);
});
