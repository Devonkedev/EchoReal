# MoodSync Setup Guide

This guide will help you set up Firebase, Spotify API, and Genius API for your MoodSync journaling app.

## 🔥 Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Enter project name: `moodsync-app`
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" provider
   - Click "Save"

3. **Create Firestore Database**
   - Go to "Firestore Database" > "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location close to your users

4. **Get Firebase Configuration**
   - Go to "Project settings" (gear icon)
   - In "Your apps" section, click "Web" icon
   - Register your app with name "MoodSync"
   - Copy the Firebase configuration object

5. **Update Firebase Config**
   - Open `/lib/firebase.js`
   - Replace the `firebaseConfig` object with your configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🎵 Spotify API Setup

1. **Create Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create app"
   - Fill in:
     - App name: `MoodSync`
     - App description: `Mood-based music recommendations for journaling`
     - Website: `http://localhost:3000` (for development)
     - Redirect URIs: `http://localhost:3000/callback`
   - Check "Web API" and agree to terms

2. **Get Spotify Credentials**
   - In your app dashboard, click "Settings"
   - Copy "Client ID" and "Client Secret"

3. **Update Spotify Config**
   - Open `/lib/spotify.js`
   - Replace the credentials:

```javascript
constructor() {
  this.clientId = 'your_spotify_client_id';
  this.clientSecret = 'your_spotify_client_secret';
  // ...
}
```

## 🎤 Genius API Setup

1. **Create Genius Account**
   - Go to [Genius API](https://genius.com/api-clients)
   - Sign up or log in
   - Click "New API Client"

2. **Create API Client**
   - Fill in:
     - App Name: `MoodSync`
     - App Website URL: `http://localhost:3000`
     - Redirect URI: `http://localhost:3000`
   - Click "Save"

3. **Get Access Token**
   - In your API client, click "Generate Access Token"
   - Copy the access token

4. **Update Genius Config**
   - Open `/lib/genius.js`
   - Replace the access token:

```javascript
constructor() {
  this.accessToken = 'your_genius_access_token';
  // ...
}
```

## 📦 Install Required Dependencies

Run these commands in your project directory:

```bash
# Firebase
npm install firebase

# Additional utilities (if not already installed)
npm install sonner@2.0.3
```

## 🚀 Running the Application

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - Create an account or sign in
   - Start journaling with music recommendations!

## 🔒 Security Rules (Firebase)

For production, update your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /journalEntries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /users/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Messages can be read by participants
    match /messages/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Groups and friendships
    match /groups/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /friendships/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Features Available

- ✅ User authentication (email/password)
- ✅ Journal entry creation and management
- ✅ Mood tracking with emoji selection
- ✅ Real Spotify music search and recommendations
- ✅ Lyrics analysis with sentiment detection
- ✅ Music recommendations based on mood and journal content
- ✅ Friend system and social sharing
- ✅ Responsive design for mobile and desktop

## 🔧 Troubleshooting

### Firebase Issues
- Ensure Firebase configuration is correct
- Check Firestore rules allow authenticated users
- Verify Authentication is properly configured

### Spotify API Issues
- Confirm Client ID and Secret are correct
- Check if your app is approved (for public use)
- Verify API endpoints are accessible

### Genius API Issues
- Ensure access token is valid
- Check rate limits (1000 requests/day for free tier)
- Verify lyrics endpoint is working

## 🌟 Next Steps

1. Set up the APIs using the instructions above
2. Test the application with real data
3. Deploy to production (consider Vercel, Netlify, or Firebase Hosting)
4. Set up proper security rules for production
5. Consider adding more advanced features like:
   - Group therapy sessions
   - Professional therapist connections
   - Advanced mood analytics
   - Playlist creation and sharing

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all API keys are correctly configured
3. Ensure Firebase project settings are correct
4. Check network connectivity for API calls

Happy journaling! 🎵✨