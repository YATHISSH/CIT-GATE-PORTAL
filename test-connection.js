
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
console.log('Testing connection...');
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connection successful!'))
  .catch(err => console.error('❌ Error:', err.message));

