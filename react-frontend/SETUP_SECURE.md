# 🔐 Secure MoodSync Setup Guide

This guide will help you set up Firebase, Spotify API, and Genius API securely for your MoodSync journaling app.

## 🚫 IMPORTANT SECURITY NOTICE

**NEVER share your API keys in chat, email, or commit them to version control!**

## 📋 Prerequisites

1. Node.js and npm installed
2. A code editor (VS Code recommended)
3. Basic knowledge of environment variables

## 🔧 Step 1: Environment Variables Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **The .env file is gitignored** - this keeps your secrets safe!

3. **Your .env file should look like this:**
   ```
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_actual_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your_firebase_app_id

   # Spotify API Configuration
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

   # Genius API Configuration
   VITE_GENIUS_ACCESS_TOKEN=your_genius_access_token
   ```

## 🔥 Step 2: Firebase Setup

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Enter project name: `moodsync-app`
   - Enable Google Analytics (optional)

2. **Enable Authentication:**
   - Go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" provider
   - Click "Save"

3. **Create Firestore Database:**
   - Go to "Firestore Database" > "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location close to your users

4. **Get Firebase Configuration:**
   - Go to "Project settings" (gear icon)
   - In "Your apps" section, click "Web" icon
   - Register your app with name "MoodSync"
   - Copy ONLY the values (not the entire object)

5. **Add to your .env file:**
   ```
   VITE_FIREBASE_API_KEY=AIzaSyC... (your actual key)
   VITE_FIREBASE_AUTH_DOMAIN=moodsync-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=moodsync-app
   VITE_FIREBASE_STORAGE_BUCKET=moodsync-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

## 🎵 Step 3: Spotify API Setup

1. **Create Spotify App:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Log in with your Spotify account
   - Click "Create app"
   - Fill in:
     - App name: `MoodSync`
     - App description: `Mood-based music recommendations for journaling`
     - Website: `http://localhost:5173` (Vite dev server)
     - Redirect URIs: `http://localhost:5173/callback`
   - Check "Web API" and agree to terms

2. **Get Spotify Credentials:**
   - In your app dashboard, click "Settings"
   - Copy "Client ID" and "Client Secret"

3. **Add to your .env file:**
   ```
   VITE_SPOTIFY_CLIENT_ID=your_actual_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_actual_client_secret
   ```

## 🎤 Step 4: Genius API Setup

1. **Create Genius Account:**
   - Go to [Genius API](https://genius.com/api-clients)
   - Sign up or log in
   - Click "New API Client"

2. **Create API Client:**
   - Fill in:
     - App Name: `MoodSync`
     - App Website URL: `http://localhost:5173`
     - Redirect URI: `http://localhost:5173`
   - Click "Save"

3. **Get Access Token:**
   - In your API client, click "Generate Access Token"
   - Copy the access token

4. **Add to your .env file:**
   ```
   VITE_GENIUS_ACCESS_TOKEN=your_actual_access_token
   ```

## 📦 Step 5: Install Dependencies

```bash
npm install firebase sonner@2.0.3
```

## 🚀 Step 6: Run the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - You should see the MoodSync login page

3. **Create an account and test:**
   - Sign up with a new email
   - Create a journal entry
   - Try the music recommendations

## ✅ Step 7: Verify Everything Works

1. **Test Authentication:**
   - Create a new account
   - Sign in and out
   - Check if user data persists

2. **Test Journaling:**
   - Create a journal entry
   - Select different moods
   - Add content and save

3. **Test Music Features:**
   - Go to Music Healing section
   - Try different moods
   - Search for songs
   - Accept/reject recommendations

4. **Check Console:**
   - Open browser dev tools (F12)
   - Look for any error messages
   - All API calls should work

## 🔒 Production Security

When deploying to production:

1. **Update Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /journalEntries/{document} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       match /users/{document} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
       }
     }
   }
   ```

2. **Update Spotify App Settings:**
   - Add your production domain to redirect URIs
   - Remove localhost URLs

3. **Set Production Environment Variables:**
   - Use your hosting platform's environment variable system
   - Never commit .env to version control

## 🆘 Troubleshooting

### Firebase Issues
- ❌ "Firebase config not found" → Check your .env file
- ❌ "Auth domain mismatch" → Verify VITE_FIREBASE_AUTH_DOMAIN
- ❌ "Permission denied" → Check Firestore rules

### Spotify Issues
- ❌ "Invalid client" → Check VITE_SPOTIFY_CLIENT_ID
- ❌ "Invalid credentials" → Verify VITE_SPOTIFY_CLIENT_SECRET
- ❌ "CORS error" → Spotify Web API doesn't have CORS issues

### Genius Issues
- ❌ "Invalid token" → Check VITE_GENIUS_ACCESS_TOKEN
- ❌ "Rate limit exceeded" → You've made too many requests

### General Issues
- ❌ "Environment variable undefined" → Restart your dev server
- ❌ "Module not found" → Run `npm install`
- ❌ "CORS policy" → Some APIs require proper headers

## 📞 Getting Help

If you're stuck:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test each API individually
4. Check that your Firebase project is active

## 🎉 Next Steps

Once everything is working:
- Customize the app styling
- Add more mood options
- Implement group features
- Deploy to production (Vercel, Netlify, etc.)

**Remember: Keep your API keys secure and never share them!** 🔐