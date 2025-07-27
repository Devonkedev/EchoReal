#!/usr/bin/env node

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_SPOTIFY_CLIENT_ID',
  'VITE_SPOTIFY_CLIENT_SECRET',
  'VITE_GENIUS_ACCESS_TOKEN'
];

console.log('🔍 Checking environment variables...\n');

const missingVars = [];
const presentVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    presentVars.push(varName);
    console.log(`✅ ${varName}: Set`);
  } else {
    missingVars.push(varName);
    console.log(`❌ ${varName}: Missing`);
  }
});

console.log('\n' + '='.repeat(50));

if (missingVars.length === 0) {
  console.log('🎉 All environment variables are set!');
  console.log('You can now run: npm run dev');
} else {
  console.log(`❌ Missing ${missingVars.length} environment variables:`);
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📋 To fix this:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Fill in your API keys in the .env file');
  console.log('3. Follow the SETUP_SECURE.md guide');
}

console.log('\n🔐 Remember: Never share your API keys!');