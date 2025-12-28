import { CulturalError, FallbackResponse, Category, UserInput, UserPreferences } from '../types';

export class ErrorHandler {
  private static readonly ERROR_CODES = {
    MISSING_SLANG: 'MISSING_SLANG',
    MISSING_FOOD: 'MISSING_FOOD',
    MISSING_FESTIVAL: 'MISSING_FESTIVAL',
    MISSING_EMOTION: 'MISSING_EMOTION',
    INVALID_INPUT: 'INVALID_INPUT',
    DATABASE_ERROR: 'DATABASE_ERROR',
    COMPONENT_FAILURE: 'COMPONENT_FAILURE'
  } as const;

  /**
   * Creates a fallback response for missing slang information
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  static createSlangFallback(term: string): FallbackResponse {
    const closestMatch = this.findClosestSlangMatch(term);
    
    let content = `I don't have specific information about "${term}" in my cultural knowledge, `;
    
    if (closestMatch) {
      content += `but it sounds similar to "${closestMatch}" which is authentic Andhra slang. `;
    }
    
    content += `These expressions usually carry deep emotional meaning in our culture. `;
    content += `Try asking about common terms like "Arey Baboi" or "Lite Teesko" for authentic examples!`;

    return {
      content,
      isApproximation: true,
      originalQuery: term,
      fallbackReason: 'Slang term not found in cultural database'
    };
  }

  /**
   * Creates a fallback response for missing food information
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  static createFoodFallback(city: string, preferences: UserPreferences): FallbackResponse {
    const closestCity = this.findClosestCityMatch(city);
    const spiceLevel = preferences.spiceLevel || 'medium';
    const dietary = preferences.dietary || 'any';
    
    let content = `I don't have specific food recommendations for ${city} `;
    
    if (closestCity) {
      content += `but ${closestCity} has similar Andhra cuisine! `;
    }
    
    content += `For ${dietary} preferences with ${spiceLevel} spice level, `;
    content += `Andhra cuisine always has something delicious. `;
    content += `Try exploring popular cities like Visakhapatnam, Vijayawada, or Guntur for authentic recommendations!`;

    return {
      content,
      isApproximation: true,
      originalQuery: city,
      fallbackReason: 'City not found in food database'
    };
  }

  /**
   * Creates a fallback response for missing festival information
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  static createFestivalFallback(festival: string): FallbackResponse {
    const closestMatch = this.findClosestFestivalMatch(festival);
    
    let content = `I don't have detailed information about "${festival}", `;
    
    if (closestMatch) {
      content += `but it might be similar to "${closestMatch}" which is celebrated in Andhra. `;
    }
    
    content += `Andhra festivals are always rich in cultural meaning and food traditions! `;
    content += `Each celebration brings families together with special preparations. `;
    content += `Try asking about Sankranti, Ugadi, or Vinayaka Chavithi for detailed examples!`;

    return {
      content,
      isApproximation: true,
      originalQuery: festival,
      fallbackReason: 'Festival not found in cultural database'
    };
  }

  /**
   * Creates a fallback response for missing emotion-food mapping
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  static createEmotionFallback(emotion: string): FallbackResponse {
    const closestMatch = this.findClosestEmotionMatch(emotion);
    
    let content = `I don't have a specific food recommendation for "${emotion}", `;
    
    if (closestMatch) {
      content += `but it's similar to feeling "${closestMatch}". `;
    }
    
    content += `In Andhra culture, we believe food can heal emotions. `;
    content += `Generally, comfort foods like Pappu with Avakaya work for sadness, `;
    content += `while cooling foods like Curd Rice help with anger. `;
    content += `Try asking about common emotions like sad, happy, angry, or tired!`;

    return {
      content,
      isApproximation: true,
      originalQuery: emotion,
      fallbackReason: 'Emotion not found in mapping database'
    };
  }

  /**
   * Creates error response for invalid input
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Input validation
   */
  static createInputValidationError(input: UserInput): CulturalError {
    let message = 'Invalid input provided. ';
    
    if (!input.category) {
      message += 'Please select a valid category (slang, food, festival, or emotion). ';
    } else if (!['slang', 'food', 'festival', 'emotion'].includes(input.category)) {
      message += `"${input.category}" is not a valid category. Choose from slang, food, festival, or emotion. `;
    }
    
    if (!input.selection || input.selection.trim() === '') {
      message += 'Please provide a selection for your chosen category. ';
    }
    
    if (input.preferences) {
      const prefErrors = this.validatePreferences(input.preferences);
      if (prefErrors.length > 0) {
        message += `Preference errors: ${prefErrors.join(', ')}. `;
      }
    }

    return {
      code: this.ERROR_CODES.INVALID_INPUT,
      message: message.trim(),
      category: input.category as Category
    };
  }

  /**
   * Creates error response for database failures
   * Requirements: 8.2 - Graceful degradation for component failures
   */
  static createDatabaseError(operation: string): CulturalError {
    return {
      code: this.ERROR_CODES.DATABASE_ERROR,
      message: `Cultural database is temporarily unavailable for ${operation}. Please try again later or contact support.`,
      fallbackData: {
        suggestion: 'Try basic cultural queries or check your connection'
      }
    };
  }

  /**
   * Creates error response for component failures
   * Requirements: 8.2 - Graceful degradation for component failures
   */
  static createComponentError(componentName: string, operation: string): CulturalError {
    return {
      code: this.ERROR_CODES.COMPONENT_FAILURE,
      message: `${componentName} component encountered an error during ${operation}. Using fallback response.`,
      fallbackData: {
        component: componentName,
        operation: operation
      }
    };
  }

  /**
   * Determines if an error is recoverable
   */
  static isRecoverableError(error: CulturalError): boolean {
    const recoverableCodes = [
      this.ERROR_CODES.MISSING_SLANG,
      this.ERROR_CODES.MISSING_FOOD,
      this.ERROR_CODES.MISSING_FESTIVAL,
      this.ERROR_CODES.MISSING_EMOTION
    ];
    
    return recoverableCodes.includes(error.code as any);
  }

  /**
   * Finds closest matching slang term using simple string similarity
   */
  private static findClosestSlangMatch(term: string): string | null {
    const knownSlang = [
      'Arey Baboi', 'Doola Teerinda', 'Taggede Le', 'Lite Teesko', 'Chala Scene Undi'
    ];
    
    return this.findClosestMatch(term, knownSlang);
  }

  /**
   * Finds closest matching city using simple string similarity
   */
  private static findClosestCityMatch(city: string): string | null {
    const knownCities = [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'
    ];
    
    return this.findClosestMatch(city, knownCities);
  }

  /**
   * Finds closest matching festival using simple string similarity
   */
  private static findClosestFestivalMatch(festival: string): string | null {
    const knownFestivals = [
      'Sankranti', 'Ugadi', 'Vinayaka Chavithi'
    ];
    
    return this.findClosestMatch(festival, knownFestivals);
  }

  /**
   * Finds closest matching emotion using simple string similarity
   */
  private static findClosestEmotionMatch(emotion: string): string | null {
    const knownEmotions = [
      'sad', 'sick', 'happy', 'angry', 'tired'
    ];
    
    return this.findClosestMatch(emotion, knownEmotions);
  }

  /**
   * Simple string similarity matching
   */
  private static findClosestMatch(target: string, candidates: string[]): string | null {
    const targetLower = target.toLowerCase();
    let bestMatch: string | null = null;
    let bestScore = 0;
    
    for (const candidate of candidates) {
      const candidateLower = candidate.toLowerCase();
      
      // Simple similarity: check for common substrings
      let score = 0;
      
      // Exact match
      if (targetLower === candidateLower) {
        return candidate;
      }
      
      // Contains match
      if (candidateLower.includes(targetLower) || targetLower.includes(candidateLower)) {
        score = 0.8;
      }
      
      // First letter match
      if (targetLower[0] === candidateLower[0]) {
        score += 0.2;
      }
      
      // Length similarity
      const lengthDiff = Math.abs(target.length - candidate.length);
      if (lengthDiff <= 2) {
        score += 0.1;
      }
      
      if (score > bestScore && score >= 0.3) {
        bestScore = score;
        bestMatch = candidate;
      }
    }
    
    return bestMatch;
  }

  /**
   * Validates user preferences and returns error messages
   */
  private static validatePreferences(preferences: UserPreferences): string[] {
    const errors: string[] = [];
    
    if (preferences.spiceLevel && !['low', 'medium', 'high', 'extreme'].includes(preferences.spiceLevel)) {
      errors.push(`Invalid spice level "${preferences.spiceLevel}"`);
    }
    
    if (preferences.dietary && !['veg', 'non-veg', 'any'].includes(preferences.dietary)) {
      errors.push(`Invalid dietary preference "${preferences.dietary}"`);
    }
    
    if (preferences.formality && !['formal', 'informal'].includes(preferences.formality)) {
      errors.push(`Invalid formality level "${preferences.formality}"`);
    }
    
    if (preferences.region && !['coastal', 'guntur', 'rayalaseema'].includes(preferences.region)) {
      errors.push(`Invalid region "${preferences.region}"`);
    }
    
    return errors;
  }
}