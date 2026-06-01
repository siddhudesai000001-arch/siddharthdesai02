// scripts/hash-password.js
// Usage: node scripts/hash-password.js yourpassword
// This will print the bcrypt hash to copy into .env

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js <your-password>');
  console.error('Example: node scripts/hash-password.js mySecretPassword123');
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log('\n✅ Password hashed successfully!\n');
  console.log('Copy this into your .env file as AUTH_PASSWORD_HASH:\n');
  console.log(hash);
  console.log('\n⚠️  Keep this hash private. Never share your .env file.');
});
