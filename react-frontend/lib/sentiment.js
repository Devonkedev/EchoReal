export class SentimentAnalysisService {
  constructor() {
    // Positive and negative word dictionaries for basic sentiment analysis
    this.positiveWords = new Set([
      'happy', 'joy', 'love', 'beautiful', 'amazing', 'wonderful', 'great', 'awesome',
      'fantastic', 'perfect', 'excellent', 'brilliant', 'outstanding', 'marvelous',
      'celebrate', 'triumph', 'victory', 'success', 'win', 'achieve', 'accomplish',
      'smile', 'laugh', 'peace', 'calm', 'serene', 'peaceful', 'tranquil', 'bliss',
      'hope', 'optimistic', 'positive', 'bright', 'light', 'sunshine', 'rainbow',
      'healing', 'recover', 'better', 'improve', 'grow', 'strength', 'strong',
      'grateful', 'thankful', 'blessed', 'lucky', 'fortunate', 'content', 'satisfied'
    ]);

    this.negativeWords = new Set([
      'sad', 'cry', 'tears', 'pain', 'hurt', 'broken', 'lost', 'alone', 'lonely',
      'depressed', 'depression', 'anxiety', 'worried', 'fear', 'scared', 'afraid',
      'angry', 'mad', 'rage', 'furious', 'hate', 'despise', 'disgusted', 'awful',
      'terrible', 'horrible', 'worst', 'bad', 'evil', 'dark', 'darkness', 'shadow',
      'death', 'die', 'dead', 'kill', 'destroy', 'ruin', 'damage', 'harm', 'injury',
      'sick', 'illness', 'disease', 'weak', 'weakness', 'fail', 'failure', 'defeat',
      'struggle', 'difficult', 'hard', 'tough', 'challenge', 'problem', 'trouble'
    ]);

    this.neutralWords = new Set([
      'and', 'or', 'but', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of',
      'with', 'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again',
      'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
      'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
    ]);

    // Emotion-specific word sets
    this.emotionWords = {
      anxiety: new Set(['anxiety', 'anxious', 'worried', 'stress', 'tension', 'nervous', 'panic', 'overwhelmed']),
      depression: new Set(['depressed', 'depression', 'hopeless', 'empty', 'numb', 'worthless', 'despair']),
      anger: new Set(['angry', 'mad', 'rage', 'furious', 'irritated', 'frustrated', 'annoyed']),
      joy: new Set(['happy', 'joy', 'joyful', 'elated', 'excited', 'thrilled', 'delighted']),
      love: new Set(['love', 'loving', 'beloved', 'adore', 'cherish', 'affection', 'romance']),
      peace: new Set(['peace', 'peaceful', 'calm', 'serene', 'tranquil', 'quiet', 'still']),
      hope: new Set(['hope', 'hopeful', 'optimistic', 'faith', 'believe', 'trust', 'confident'])
    };
  }

  analyzeLyrics(lyrics) {
    if (!lyrics || typeof lyrics !== 'string') {
      return {
        overall: 'neutral',
        score: 0,
        emotions: {},
        positiveWords: [],
        negativeWords: [],
        wordCount: 0,
        sentimentBreakdown: {
          positive: 0,
          negative: 0,
          neutral: 0
        }
      };
    }

    // Clean and tokenize the lyrics
    const words = this.tokenize(lyrics.toLowerCase());
    const wordCount = words.length;

    // Count sentiment words
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    const foundPositiveWords = [];
    const foundNegativeWords = [];
    const emotions = {};

    // Initialize emotion counts
    Object.keys(this.emotionWords).forEach(emotion => {
      emotions[emotion] = 0;
    });

    // Analyze each word
    words.forEach(word => {
      if (this.positiveWords.has(word)) {
        positiveCount++;
        foundPositiveWords.push(word);
      } else if (this.negativeWords.has(word)) {
        negativeCount++;
        foundNegativeWords.push(word);
      } else if (this.neutralWords.has(word)) {
        neutralCount++;
      }

      // Check for specific emotions
      Object.entries(this.emotionWords).forEach(([emotion, wordSet]) => {
        if (wordSet.has(word)) {
          emotions[emotion]++;
        }
      });
    });

    // Calculate overall sentiment score (-1 to 1)
    const totalSentimentWords = positiveCount + negativeCount;
    let score = 0;
    
    if (totalSentimentWords > 0) {
      score = (positiveCount - negativeCount) / totalSentimentWords;
    }

    // Determine overall sentiment
    let overall = 'neutral';
    if (score > 0.1) {
      overall = 'positive';
    } else if (score < -0.1) {
      overall = 'negative';
    }

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      overall,
      score,
      emotions,
      dominantEmotion: dominantEmotion[1] > 0 ? dominantEmotion[0] : null,
      positiveWords: [...new Set(foundPositiveWords)],
      negativeWords: [...new Set(foundNegativeWords)],
      wordCount,
      sentimentBreakdown: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount
      },
      recommendation: this.getRecommendation(overall, emotions, dominantEmotion[0])
    };
  }

  tokenize(text) {
    // Remove punctuation and split into words
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  getRecommendation(sentiment, emotions, dominantEmotion) {
    // Provide recommendations based on sentiment analysis
    if (sentiment === 'negative') {
      if (dominantEmotion === 'anxiety') {
        return {
          type: 'calming',
          message: 'Based on anxious themes, we recommend calming, peaceful music to help reduce stress.',
          suggestedMoods: ['😌', '🧘'],
          suggestedGenres: ['ambient', 'classical', 'meditation']
        };
      } else if (dominantEmotion === 'depression') {
        return {
          type: 'uplifting',
          message: 'Based on melancholic themes, we recommend gradually uplifting music to improve mood.',
          suggestedMoods: ['😊', '🌅'],
          suggestedGenres: ['folk', 'indie', 'acoustic']
        };
      } else if (dominantEmotion === 'anger') {
        return {
          type: 'release',
          message: 'Based on angry themes, we recommend music that helps release tension and find peace.',
          suggestedMoods: ['😤', '😌'],
          suggestedGenres: ['rock', 'metal', 'then calm']
        };
      }
      
      return {
        type: 'healing',
        message: 'We recommend gentle, healing music to help process difficult emotions.',
        suggestedMoods: ['😌', '🤗'],
        suggestedGenres: ['acoustic', 'folk', 'ambient']
      };
    } else if (sentiment === 'positive') {
      return {
        type: 'celebratory',
        message: 'Based on positive themes, we recommend upbeat music to celebrate and maintain good vibes.',
        suggestedMoods: ['😊', '🎉'],
        suggestedGenres: ['pop', 'dance', 'upbeat']
      };
    }

    return {
      type: 'balanced',
      message: 'We recommend a balanced mix of music to match your current emotional state.',
      suggestedMoods: ['😌', '😊'],
      suggestedGenres: ['indie', 'alternative', 'chill']
    };
  }

  // Get mood emoji based on sentiment analysis
  getMoodFromSentiment(analysis) {
    if (analysis.dominantEmotion) {
      const emotionToMood = {
        joy: '😊',
        love: '😍',
        peace: '😌',
        hope: '🌅',
        anxiety: '😰',
        depression: '😔',
        anger: '😤'
      };
      
      return emotionToMood[analysis.dominantEmotion] || '😐';
    }

    // Fallback to overall sentiment
    if (analysis.overall === 'positive') return '😊';
    if (analysis.overall === 'negative') return '😔';
    return '😐';
  }
}

// Create singleton instance
export const sentimentService = new SentimentAnalysisService();