import { auth } from './firebase.js';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.isDemoMode = !auth || auth.signInWithEmailAndPassword === undefined;
    
    if (this.isDemoMode) {
      console.warn('🔐 Authentication is running in demo mode');
      console.warn('📋 To use real authentication, configure Firebase credentials');
      
      // Create a mock user for demo purposes
      setTimeout(() => {
        this.currentUser = {
          uid: 'demo-user-123',
          email: 'demo@example.com',
          displayName: 'Demo User',
          photoURL: null
        };
        this.listeners.forEach(callback => callback(this.currentUser));
      }, 1000);
    }
  }

  // Initialize auth state listener
  init() {
    if (this.isDemoMode) {
      return () => {}; // Return empty unsubscribe function
    }

    try {
      const { onAuthStateChanged } = require('firebase/auth');
      return onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        this.listeners.forEach(callback => callback(user));
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      return () => {};
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    
    // Call immediately with current user
    if (this.currentUser) {
      callback(this.currentUser);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  async signUp(email, password, displayName) {
    if (this.isDemoMode) {
      // Simulate signup delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.currentUser = {
        uid: `demo-user-${Date.now()}`,
        email: email,
        displayName: displayName,
        photoURL: null
      };
      
      this.listeners.forEach(callback => callback(this.currentUser));
      return this.currentUser;
    }

    try {
      const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    if (this.isDemoMode) {
      // Simulate signin delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.currentUser = {
        uid: 'demo-user-123',
        email: email,
        displayName: 'Demo User',
        photoURL: null
      };
      
      this.listeners.forEach(callback => callback(this.currentUser));
      return this.currentUser;
    }

    try {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signOut() {
    if (this.isDemoMode) {
      this.currentUser = null;
      this.listeners.forEach(callback => callback(null));
      return;
    }

    try {
      const { signOut: firebaseSignOut } = require('firebase/auth');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}

// Create singleton instance
export const authService = new AuthService();