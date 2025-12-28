import { UserInput, UserPreferences, Category, CulturalError, ValidationResult } from '../types';
import { ErrorHandler } from './ErrorHandler';

/**
 * Comprehensive validation service for all user inputs
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Input validation and error responses
 */
export class ValidationService {
  private static readonly VALID_CATEGORIES: Category[] = ['slang', 'food', 'festival', 'emotion'];
  private static readonly VALID_SPICE_LEVELS = ['low', 'medium', 'high', 'extreme'];
  private static readonly VALID_DIETARY_PREFS = ['veg', 'non-veg', 'any'];
  private static readonly VALID_FORMALITY_LEVELS = ['formal', 'informal'];
  private static readonly VALID_REGIONS = ['coastal', 'guntur', 'rayalaseema'];

  /**
   * Validates complete user input with detailed error reporting
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Comprehensive input validation
   */
  static validateUserInput(input: UserInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate category
      if (!input.category) {
        errors.push('Category is required. Please select from: slang, food, festival, or emotion.');
      } else if (!this.VALID_CATEGORIES.includes(input.category)) {
        errors.push(`"${input.category}" is not a valid category. Please choose from: ${this.VALID_CATEGORIES.join(', ')}.`);
      }

      // Validate selection
      if (!input.selection) {
        errors.push('Selection is required. Please make a choice for your selected category.');
      } else if (input.selection.trim() === '') {
        errors.push('Selection cannot be empty. Please provide a valid selection.');
      } else if (input.selection.length > 100) {
        errors.push('Selection is too long. Please keep it under 100 characters.');
      }

      // Validate preferences if provided
      if (input.preferences) {
        const prefValidation = this.validatePreferences(input.preferences);
        errors.push(...prefValidation.errors);
        warnings.push(...prefValidation.warnings);
      }

      // Category-specific validation
      if (input.category && this.VALID_CATEGORIES.includes(input.category)) {
        const categoryValidation = this.validateCategorySpecificInput(input);
        errors.push(...categoryValidation.errors);
        warnings.push(...categoryValidation.warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation failed due to system error. Please try again.'],
        warnings: []
      };
    }
  }

  /**
   * Validates user preferences with detailed feedback
   */
  static validatePreferences(preferences: UserPreferences): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate spice level
    if (preferences.spiceLevel && !this.VALID_SPICE_LEVELS.includes(preferences.spiceLevel)) {
      errors.push(`Spice level "${preferences.spiceLevel}" is not valid. Choose from: ${this.VALID_SPICE_LEVELS.join(', ')}.`);
    }

    // Validate dietary preference
    if (preferences.dietary && !this.VALID_DIETARY_PREFS.includes(preferences.dietary)) {
      errors.push(`Dietary preference "${preferences.dietary}" is not valid. Choose from: ${this.VALID_DIETARY_PREFS.join(', ')}.`);
    }

    // Validate formality level
    if (preferences.formality && !this.VALID_FORMALITY_LEVELS.includes(preferences.formality)) {
      errors.push(`Formality level "${preferences.formality}" is not valid. Choose from: ${this.VALID_FORMALITY_LEVELS.join(', ')}.`);
    }

    // Validate region
    if (preferences.region && !this.VALID_REGIONS.includes(preferences.region)) {
      errors.push(`Region "${preferences.region}" is not valid. Choose from: ${this.VALID_REGIONS.join(', ')}.`);
    }

    // Add helpful warnings for preference combinations
    if (preferences.spiceLevel === 'extreme' && preferences.region !== 'guntur') {
      warnings.push('Extreme spice level is most authentic in Guntur region. Consider selecting Guntur for the most authentic experience.');
    }

    if (preferences.dietary === 'non-veg' && preferences.formality === 'formal') {
      warnings.push('Non-vegetarian options might be limited in formal settings. Consider vegetarian alternatives for formal occasions.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates category-specific input requirements
   */
  static validateCategorySpecificInput(input: UserInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (input.category) {
      case 'slang':
        if (input.selection && input.selection.length < 2) {
          errors.push('Slang term is too short. Please provide a meaningful slang expression.');
        }
        if (input.preferences?.formality === 'formal') {
          warnings.push('Slang expressions are typically informal. Consider setting formality to "informal" for better results.');
        }
        break;

      case 'food':
        if (!input.preferences?.spiceLevel) {
          warnings.push('Consider specifying your spice tolerance for better food recommendations.');
        }
        if (!input.preferences?.dietary) {
          warnings.push('Specifying dietary preferences (veg/non-veg) will help provide more accurate recommendations.');
        }
        break;

      case 'festival':
        if (input.selection && input.selection.length < 3) {
          errors.push('Festival name is too short. Please provide a complete festival name.');
        }
        break;

      case 'emotion':
        if (input.selection && !this.isValidEmotion(input.selection)) {
          warnings.push('Consider using common emotions like sad, happy, angry, tired, or sick for best results.');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Creates user-friendly error response for validation failures
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages
   */
  static createValidationErrorResponse(input: UserInput): CulturalError {
    const validation = this.validateUserInput(input);
    
    let message = 'Please check your input: ';
    
    if (validation.errors.length > 0) {
      message += validation.errors.join(' ');
    }
    
    if (validation.warnings.length > 0) {
      message += ' Note: ' + validation.warnings.join(' ');
    }

    return {
      code: 'VALIDATION_ERROR',
      message: message.trim(),
      category: input.category,
      fallbackData: {
        validCategories: this.VALID_CATEGORIES,
        validSpiceLevels: this.VALID_SPICE_LEVELS,
        validDietaryPrefs: this.VALID_DIETARY_PREFS,
        validRegions: this.VALID_REGIONS
      }
    };
  }

  /**
   * Provides helpful suggestions for invalid input
   */
  static getSuggestions(input: UserInput): string[] {
    const suggestions: string[] = [];

    if (!input.category || !this.VALID_CATEGORIES.includes(input.category)) {
      suggestions.push('Try starting with a category: slang, food, festival, or emotion');
    }

    if (input.category === 'food' && !input.preferences?.spiceLevel) {
      suggestions.push('Specify your spice tolerance (low, medium, high, extreme) for better recommendations');
    }

    if (input.category === 'slang' && input.preferences?.formality === 'formal') {
      suggestions.push('Most slang is informal - try setting formality to "informal"');
    }

    if (!input.preferences?.region) {
      suggestions.push('Consider specifying a region (coastal, guntur, rayalaseema) for more authentic responses');
    }

    return suggestions;
  }

  /**
   * Checks if the emotion is commonly supported
   */
  private static isValidEmotion(emotion: string): boolean {
    const commonEmotions = ['sad', 'happy', 'angry', 'tired', 'sick', 'excited', 'stressed', 'lonely', 'confused'];
    return commonEmotions.includes(emotion.toLowerCase());
  }

  /**
   * Sanitizes user input to prevent issues
   */
  static sanitizeInput(input: UserInput): UserInput {
    return {
      category: input.category,
      selection: input.selection?.trim().substring(0, 100) || '',
      preferences: input.preferences ? {
        spiceLevel: input.preferences.spiceLevel,
        dietary: input.preferences.dietary,
        formality: input.preferences.formality,
        region: input.preferences.region
      } : undefined
    };
  }
}