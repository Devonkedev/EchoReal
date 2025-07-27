import { spotifyService } from './spotify.js';
import { geniusService } from './genius.js';
import { sentimentService } from './sentiment.js';

export class MusicRecommendationService {
  constructor() {
    this.userPreferences = {
      rejectedSongs: new Set(),
      acceptedSongs: new Set(),
      preferredGenres: new Set(),
      moodHistory: []
    };
  }

  async getRecommendationsForMood(mood, journalContent = '', limit = 10) {
    try {
      // Analyze journal content if provided
      let contentAnalysis = null;
      if (journalContent) {
        contentAnalysis = sentimentService.analyzeLyrics(journalContent);
      }

      // Get base recommendations from Spotify
      let recommendations = await spotifyService.searchByMood(mood, limit * 2);

      // Filter out rejected songs
      recommendations = recommendations.filter(song => 
        !this.userPreferences.rejectedSongs.has(song.id)
      );

      // Enhance recommendations with lyrics analysis
      const enhancedRecommendations = await Promise.all(
        recommendations.slice(0, limit).map(async (song) => {
          try {
            // Get lyrics for the song
            const lyrics = await geniusService.getLyricsFromAPI(song.artist, song.name);
            
            let lyricsAnalysis = null;
            let matchScore = 0.5; // Default match score
            
            if (lyrics) {
              lyricsAnalysis = sentimentService.analyzeLyrics(lyrics);
              
              // Calculate match score based on journal content and mood
              matchScore = this.calculateMatchScore(mood, contentAnalysis, lyricsAnalysis);
            }

            return {
              ...song,
              lyrics,
              lyricsAnalysis,
              matchScore,
              reason: this.generateRecommendationReason(mood, lyricsAnalysis, contentAnalysis)
            };
          } catch (error) {
            console.error(`Error analyzing song ${song.name}:`, error);
            return {
              ...song,
              lyrics: null,
              lyricsAnalysis: null,
              matchScore: 0.3,
              reason: `This ${this.getMoodDescription(mood)} song might help based on your current mood.`
            };
          }
        })
      );

      // Sort by match score
      enhancedRecommendations.sort((a, b) => b.matchScore - a.matchScore);

      return enhancedRecommendations;
    } catch (error) {
      console.error('Error getting mood recommendations:', error);
      throw error;
    }
  }

  calculateMatchScore(mood, contentAnalysis, lyricsAnalysis) {
    let score = 0.5; // Base score

    if (!lyricsAnalysis) return score;

    // Map moods to desired sentiment characteristics
    const moodTargets = {
      '😊': { sentiment: 'positive', emotions: ['joy', 'love'] },
      '😌': { sentiment: 'positive', emotions: ['peace', 'hope'] },
      '😔': { sentiment: 'healing', emotions: ['hope', 'peace'] }, // For sad mood, we want healing songs
      '😤': { sentiment: 'release', emotions: ['peace'] }, // For frustrated mood, we want calming songs
      '😴': { sentiment: 'neutral', emotions: ['peace'] },
      '😍': { sentiment: 'positive', emotions: ['joy', 'love'] },
      '😰': { sentiment: 'calming', emotions: ['peace', 'hope'] },
      '😎': { sentiment: 'positive', emotions: ['joy'] }
    };

    const target = moodTargets[mood];
    if (!target) return score;

    // Adjust score based on sentiment match
    if (mood === '😔' || mood === '😤' || mood === '😰') {
      // For negative moods, prefer songs that help healing (positive or neutral)
      if (lyricsAnalysis.overall === 'positive' || lyricsAnalysis.overall === 'neutral') {
        score += 0.3;
      }
      if (lyricsAnalysis.overall === 'negative') {
        score -= 0.2; // Slightly prefer not too negative songs
      }
    } else {
      // For positive moods, prefer matching sentiment
      if (lyricsAnalysis.overall === target.sentiment || lyricsAnalysis.overall === 'positive') {
        score += 0.3;
      }
    }

    // Boost score for target emotions
    target.emotions.forEach(emotion => {
      if (lyricsAnalysis.emotions[emotion] > 0) {
        score += 0.2;
      }
    });

    // If we have journal content analysis, factor that in
    if (contentAnalysis) {
      // If journal is negative, prefer songs that offer hope or peace
      if (contentAnalysis.overall === 'negative') {
        if (lyricsAnalysis.emotions.hope > 0 || lyricsAnalysis.emotions.peace > 0) {
          score += 0.3;
        }
      }
      
      // If journal mentions specific emotions, try to match or counterbalance
      if (contentAnalysis.dominantEmotion && lyricsAnalysis.emotions[contentAnalysis.dominantEmotion]) {
        score += 0.1;
      }
    }

    // Boost score for previously accepted similar songs
    if (this.userPreferences.acceptedSongs.size > 0) {
      // This would need more sophisticated logic in a real implementation
      score += 0.1;
    }

    return Math.min(1.0, Math.max(0.0, score));
  }

  generateRecommendationReason(mood, lyricsAnalysis, contentAnalysis) {
    const moodDescriptions = {
      '😊': 'happy',
      '😌': 'calm',
      '😔': 'sad',
      '😤': 'frustrated',
      '😴': 'tired',
      '😍': 'excited',
      '😰': 'anxious',
      '😎': 'confident'
    };

    const moodDesc = moodDescriptions[mood] || 'current';

    if (!lyricsAnalysis) {
      return `This song matches your ${moodDesc} mood and might help with your current feelings.`;
    }

    // Generate reasons based on analysis
    const reasons = [];

    if (mood === '😔' && lyricsAnalysis.emotions.hope > 0) {
      reasons.push("offers hopeful messages to lift your spirits");
    } else if (mood === '😰' && lyricsAnalysis.emotions.peace > 0) {
      reasons.push("has calming lyrics to help reduce anxiety");
    } else if (mood === '😤' && lyricsAnalysis.overall === 'positive') {
      reasons.push("provides positive energy to help you move past frustration");
    } else if (mood === '😊' && lyricsAnalysis.emotions.joy > 0) {
      reasons.push("celebrates joyful moments like yours");
    } else if (lyricsAnalysis.overall === 'positive') {
      reasons.push("has uplifting lyrics to support your emotional journey");
    } else if (lyricsAnalysis.emotions.peace > 0) {
      reasons.push("promotes inner peace and emotional healing");
    }

    if (contentAnalysis && contentAnalysis.dominantEmotion) {
      if (lyricsAnalysis.emotions[contentAnalysis.dominantEmotion] > 0) {
        reasons.push(`resonates with the ${contentAnalysis.dominantEmotion} you expressed in your journal`);
      }
    }

    if (reasons.length === 0) {
      return `This song complements your ${moodDesc} mood and emotional state.`;
    }

    return `This song ${reasons.join(' and ')}.`;
  }

  getMoodDescription(mood) {
    const descriptions = {
      '😊': 'uplifting',
      '😌': 'calming',
      '😔': 'healing',
      '😤': 'releasing',
      '😴': 'soothing',
      '😍': 'energizing',
      '😰': 'peaceful',
      '😎': 'confident'
    };
    return descriptions[mood] || 'mood-matching';
  }

  acceptSong(songId) {
    this.userPreferences.acceptedSongs.add(songId);
    this.userPreferences.rejectedSongs.delete(songId);
  }

  rejectSong(songId) {
    this.userPreferences.rejectedSongs.add(songId);
    this.userPreferences.acceptedSongs.delete(songId);
  }

  updateMoodHistory(mood) {
    this.userPreferences.moodHistory.push({
      mood,
      timestamp: new Date()
    });
    
    // Keep only last 50 mood entries
    if (this.userPreferences.moodHistory.length > 50) {
      this.userPreferences.moodHistory = this.userPreferences.moodHistory.slice(-50);
    }
  }

  getPersonalizedRecommendations(limit = 10) {
    // This would analyze user's mood history and preferences
    // For now, return general recommendations
    return this.getRecommendationsForMood('😌', '', limit);
  }
}

// Create singleton instance
export const recommendationService = new MusicRecommendationService();