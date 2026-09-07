// Test if the env var is correct and DNS resolves
require('dotenv').config();
const dns = require('dns');
const url = new URL(process.env.DATABASE_URL);
console.log('Host:', url.hostname);
console.log('Port:', url.port);

dns.lookup(url.hostname, (err, addr) => {
  if (err) console.error('DNS FAIL:', err.message);
  else console.log('DNS resolves to:', addr);
});
