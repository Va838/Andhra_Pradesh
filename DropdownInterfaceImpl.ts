import { DropdownInterface } from '../interfaces/DropdownInterface';
import { UserInput, UserPreferences, Category, CulturalError } from '../types';
import { ErrorHandler } from './ErrorHandler';

export class DropdownInterfaceImpl implements DropdownInterface {
  private readonly categories: Category[] = ['slang', 'food', 'festival', 'emotion'];
  
  private readonly subcategories: Record<Category, string[]> = {
    slang: [
      'greeting expressions',
      'emotional expressions', 
      'casual conversation',
      'family terms',
      'food-related slang'
    ],
    food: [
      'breakfast items',
      'street food',
      'main meals',
      'snacks',
      'beverages',
      'sweets'
    ],
    festival: [
      'Ugadi',
      'Sankranti',
      'Dussehra',
      'Diwali',
      'Vinayaka Chavithi',
      'Shivaratri'
    ],
    emotion: [
      'sad',
      'happy',
      'angry',
      'tired',
      'sick',
      'excited',
      'stressed'
    ]
  };

  getCategories(): string[] {
    return [...this.categories];
  }

  getSubcategories(category: string): string[] {
    try {
      if (!this.isValidCategory(category)) {
        throw new Error(`Invalid category: ${category}. Valid categories are: ${this.categories.join(', ')}`);
      }
      return [...this.subcategories[category as Category]];
    } catch (error) {
      console.error('Error getting subcategories:', error);
      throw error;
    }
  }

  processSelection(category: string, selection: string, preferences?: UserPreferences): UserInput {
    try {
      // Validate category
      if (!this.isValidCategory(category)) {
        throw new Error(`Invalid category: ${category}. Please select from: ${this.categories.join(', ')}`);
      }

      // Validate selection
      if (!selection || selection.trim() === '') {
        throw new Error('Please provide a selection for your chosen category');
      }

      const validSubcategories = this.subcategories[category as Category];
      if (!validSubcategories.includes(selection)) {
        throw new Error(`"${selection}" is not available for ${category}. Available options: ${validSubcategories.join(', ')}`);
      }

      // Validate preferences if provided
      if (preferences) {
        this.validatePreferences(preferences);
      }

      return {
        category: category as Category,
        selection: selection.trim(),
        preferences: preferences ? { ...preferences } : undefined
      };
    } catch (error) {
      console.error('Error processing selection:', error);
      throw error;
    }
  }

  /**
   * Validates selection and returns detailed error information
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for invalid selections
   */
  validateSelection(category: string, selection: string, preferences?: UserPreferences): { isValid: boolean; error?: CulturalError } {
    try {
      this.processSelection(category, selection, preferences);
      return { isValid: true };
    } catch (error) {
      const userInput: UserInput = {
        category: category as Category,
        selection: selection || '',
        preferences
      };
      
      const culturalError = ErrorHandler.createInputValidationError(userInput);
      return { isValid: false, error: culturalError };
    }
  }

  /**
   * Gets user-friendly error message for invalid category
   * Requirements: 1.1 - User-friendly error messages
   */
  getCategoryErrorMessage(category: string): string {
    if (!category || category.trim() === '') {
      return 'Please select a category to explore Andhra culture. Choose from slang, food, festival, or emotion.';
    }
    
    return `"${category}" is not a valid category. Please choose from: ${this.categories.join(', ')}.`;
  }

  /**
   * Gets user-friendly error message for invalid selection
   * Requirements: 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for selections
   */
  getSelectionErrorMessage(category: string, selection: string): string {
    if (!this.isValidCategory(category)) {
      return this.getCategoryErrorMessage(category);
    }
    
    if (!selection || selection.trim() === '') {
      return `Please make a selection for ${category}. Available options: ${this.subcategories[category as Category].join(', ')}.`;
    }
    
    const validOptions = this.subcategories[category as Category];
    return `"${selection}" is not available for ${category}. Try one of these: ${validOptions.join(', ')}.`;
  }

  private isValidCategory(category: string): category is Category {
    return this.categories.includes(category as Category);
  }

  private validatePreferences(preferences: UserPreferences): void {
    const validSpiceLevels = ['low', 'medium', 'high', 'extreme'];
    const validDietaryPrefs = ['veg', 'non-veg', 'any'];
    const validFormalityLevels = ['formal', 'informal'];
    const validRegions = ['coastal', 'guntur', 'rayalaseema'];

    if (preferences.spiceLevel && !validSpiceLevels.includes(preferences.spiceLevel)) {
      throw new Error(`Invalid spice level: "${preferences.spiceLevel}". Please choose from: ${validSpiceLevels.join(', ')}`);
    }

    if (preferences.dietary && !validDietaryPrefs.includes(preferences.dietary)) {
      throw new Error(`Invalid dietary preference: "${preferences.dietary}". Please choose from: ${validDietaryPrefs.join(', ')}`);
    }

    if (preferences.formality && !validFormalityLevels.includes(preferences.formality)) {
      throw new Error(`Invalid formality level: "${preferences.formality}". Please choose from: ${validFormalityLevels.join(', ')}`);
    }

    if (preferences.region && !validRegions.includes(preferences.region)) {
      throw new Error(`Invalid region: "${preferences.region}". Please choose from: ${validRegions.join(', ')}`);
    }
  }

  /**
   * Gets user-friendly error message for invalid preferences
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for preferences
   */
  getPreferencesErrorMessage(preferences: UserPreferences): string[] {
    const errors: string[] = [];
    
    const validSpiceLevels = ['low', 'medium', 'high', 'extreme'];
    const validDietaryPrefs = ['veg', 'non-veg', 'any'];
    const validFormalityLevels = ['formal', 'informal'];
    const validRegions = ['coastal', 'guntur', 'rayalaseema'];

    if (preferences.spiceLevel && !validSpiceLevels.includes(preferences.spiceLevel)) {
      errors.push(`Spice level "${preferences.spiceLevel}" is not valid. Choose from: ${validSpiceLevels.join(', ')}`);
    }

    if (preferences.dietary && !validDietaryPrefs.includes(preferences.dietary)) {
      errors.push(`Dietary preference "${preferences.dietary}" is not valid. Choose from: ${validDietaryPrefs.join(', ')}`);
    }

    if (preferences.formality && !validFormalityLevels.includes(preferences.formality)) {
      errors.push(`Formality level "${preferences.formality}" is not valid. Choose from: ${validFormalityLevels.join(', ')}`);
    }

    if (preferences.region && !validRegions.includes(preferences.region)) {
      errors.push(`Region "${preferences.region}" is not valid. Choose from: ${validRegions.join(', ')}`);
    }

    return errors;
  }
}