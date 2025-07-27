import { db } from './firebase.js';

// Check if Firebase is properly configured
const isFirebaseConfigured = db && typeof db.collection === 'function';

export class DatabaseService {
  // Journal Entries
  static async createJournalEntry(userId, entry) {
    if (!isFirebaseConfigured) {
      console.warn('📝 Database running in demo mode - data will not persist');
      // Return a mock ID
      return `demo-entry-${Date.now()}`;
    }

    try {
      const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
      
      const docRef = await addDoc(collection(db, 'journalEntries'), {
        userId,
        mood: entry.mood,
        content: entry.content,
        songs: entry.songs || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  static async getUserJournalEntries(userId) {
    if (!isFirebaseConfigured) {
      console.warn('📝 Database running in demo mode - returning mock data');
      
      // Return mock journal entries
      return [
        {
          id: 'demo-1',
          userId: userId,
          mood: '😌',
          content: 'Today was a peaceful day. I felt calm and centered.',
          songs: [],
          createdAt: new Date(Date.now() - 86400000), // Yesterday
          updatedAt: new Date(Date.now() - 86400000)
        },
        {
          id: 'demo-2',
          userId: userId,
          mood: '😊',
          content: 'Feeling grateful for the small moments of joy in life.',
          songs: [
            {
              id: 'demo1',
              name: 'Peaceful Mind',
              artist: 'Healing Sounds'
            }
          ],
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          updatedAt: new Date(Date.now() - 172800000)
        }
      ];
    }

    try {
      const { collection, getDocs, query, where, orderBy } = require('firebase/firestore');
      
      const q = query(
        collection(db, 'journalEntries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  }

  static subscribeToUserJournalEntries(userId, callback) {
    if (!isFirebaseConfigured) {
      console.warn('📝 Database running in demo mode - using mock subscription');
      
      // Call callback with mock data immediately
      setTimeout(() => {
        callback([
          {
            id: 'demo-1',
            userId: userId,
            mood: '😌',
            content: 'Today was a peaceful day. I felt calm and centered.',
            songs: [],
            createdAt: new Date()
          }
        ]);
      }, 100);
      
      // Return empty unsubscribe function
      return () => {};
    }

    try {
      const { collection, query, where, orderBy, onSnapshot } = require('firebase/firestore');
      
      const q = query(
        collection(db, 'journalEntries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      return onSnapshot(q, (querySnapshot) => {
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(entries);
      });
    } catch (error) {
      console.error('Error subscribing to journal entries:', error);
      return () => {};
    }
  }

  static async updateJournalEntry(entryId, updates) {
    if (!isFirebaseConfigured) {
      console.warn('📝 Database running in demo mode - update not persisted');
      return;
    }

    try {
      const { doc, updateDoc, serverTimestamp } = require('firebase/firestore');
      
      const entryRef = doc(db, 'journalEntries', entryId);
      await updateDoc(entryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  }

  static async deleteJournalEntry(entryId) {
    if (!isFirebaseConfigured) {
      console.warn('📝 Database running in demo mode - delete not persisted');
      return;
    }

    try {
      const { doc, deleteDoc } = require('firebase/firestore');
      await deleteDoc(doc(db, 'journalEntries', entryId));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  // Other methods with similar demo mode handling...
  static async createUser(uid, userData) {
    if (!isFirebaseConfigured) {
      console.warn('👤 User creation in demo mode - not persisted');
      return;
    }

    try {
      const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
      await addDoc(collection(db, 'users'), {
        uid,
        ...userData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUser(uid) {
    if (!isFirebaseConfigured) {
      return {
        id: 'demo-user',
        uid: uid,
        displayName: 'Demo User',
        email: 'demo@example.com'
      };
    }

    try {
      const { collection, getDocs, query, where } = require('firebase/firestore');
      
      const q = query(collection(db, 'users'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}