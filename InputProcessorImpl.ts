import { InputProcessor } from '../interfaces/InputProcessor';
import { UserInput, EnrichedInput, UserIntent, Category, UserPreferences, CulturalError, Region } from '../types';
import { ErrorHandler } from './ErrorHandler';

export class InputProcessorImpl implements InputProcessor {
  private readonly validCategories: Category[] = ['slang', 'food', 'festival', 'emotion'];
  
  validateInput(input: UserInput): boolean {
    try {
      // Check if category is valid
      if (!input.category || !this.validCategories.includes(input.category)) {
        return false;
      }

      // Check if selection is provided and not empty
      if (!input.selection || input.selection.trim() === '') {
        return false;
      }

      // Validate preferences if provided
      if (input.preferences) {
        return this.validatePreferences(input.preferences);
      }

      return true;
    } catch (error) {
      console.error('Error validating input:', error);
      return false;
    }
  }

  enrichInput(input: UserInput): EnrichedInput {
    if (!this.validateInput(input)) {
      const validationError = ErrorHandler.createInputValidationError(input);
      throw new Error(validationError.message);
    }

    try {
      return {
        ...input,
        timestamp: new Date(),
        sessionId: this.generateSessionId()
      };
    } catch (error) {
      console.error('Error enriching input:', error);
      throw new Error('Failed to enrich input data');
    }
  }

  inferIntent(input: EnrichedInput): UserIntent {
    if (!this.validateInput(input)) {
      const validationError = ErrorHandler.createInputValidationError(input);
      throw new Error(validationError.message);
    }

    try {
      // Ensure preferences are always defined for intent
      const preferences: UserPreferences = input.preferences || {};
      
      // Infer context based on category and current time
      const context = this.inferContext(input.category, preferences);

      return {
        category: input.category,
        selection: input.selection.trim(),
        preferences,
        context
      };
    } catch (error) {
      console.error('Error inferring intent:', error);
      throw new Error('Failed to infer user intent');
    }
  }

  /**
   * Validates input and returns detailed error information
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Input validation with user-friendly errors
   */
  validateInputWithDetails(input: UserInput): { isValid: boolean; error?: CulturalError } {
    try {
      if (this.validateInput(input)) {
        return { isValid: true };
      }
      
      const error = ErrorHandler.createInputValidationError(input);
      return { isValid: false, error };
    } catch (error) {
      return {
        isValid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Unable to validate input due to system error'
        }
      };
    }
  }

  private validatePreferences(preferences: UserPreferences): boolean {
    const validSpiceLevels = ['low', 'medium', 'high', 'extreme'];
    const validDietaryPrefs = ['veg', 'non-veg', 'any'];
    const validFormalityLevels = ['formal', 'informal'];
    const validRegions = ['coastal', 'guntur', 'rayalaseema'];

    if (preferences.spiceLevel && !validSpiceLevels.includes(preferences.spiceLevel)) {
      return false;
    }

    if (preferences.dietary && !validDietaryPrefs.includes(preferences.dietary)) {
      return false;
    }

    if (preferences.formality && !validFormalityLevels.includes(preferences.formality)) {
      return false;
    }

    if (preferences.region && !validRegions.includes(preferences.region)) {
      return false;
    }

    return true;
  }

  private inferContext(category: Category, preferences: UserPreferences) {
    const context: { region?: Region; timeOfDay?: string } = {};

    // Set region from preferences or default
    if (preferences.region) {
      context.region = preferences.region as Region;
    }

    // Infer time of day based on current time
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 10) {
      context.timeOfDay = 'morning';
    } else if (currentHour >= 10 && currentHour < 16) {
      context.timeOfDay = 'afternoon';
    } else if (currentHour >= 16 && currentHour < 20) {
      context.timeOfDay = 'evening';
    } else {
      context.timeOfDay = 'night';
    }

    return context;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}