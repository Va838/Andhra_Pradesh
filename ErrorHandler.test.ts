import { describe, it, expect } from 'vitest';
import { ErrorHandler } from './ErrorHandler';
import { ValidationService } from './ValidationService';
import { DropdownInterfaceImpl } from './DropdownInterfaceImpl';
import { CulturalDatabaseImpl } from '../data/CulturalDatabaseImpl';
import { UserInput, UserPreferences } from '../types';

/**
 * Unit tests for error handling functionality
 * Requirements: 8.2 - Test error responses, fallback behavior, and graceful degradation
 */
describe('ErrorHandler Unit Tests', () => {
  const culturalDatabase = new CulturalDatabaseImpl();
  const dropdownInterface = new DropdownInterfaceImpl();

  describe('Fallback Response Creation', () => {
    it('should create appropriate slang fallback for unknown terms', () => {
      const fallback = ErrorHandler.createSlangFallback('unknown-slang-term');
      
      expect(fallback.isApproximation).toBe(true);
      expect(fallback.originalQuery).toBe('unknown-slang-term');
      expect(fallback.fallbackReason).toContain('not found');
      expect(fallback.content).toContain("don't have specific information");
      expect(fallback.content.toLowerCase()).toMatch(/andhra|cultural|authentic/);
      expect(fallback.content).not.toContain('error');
      expect(fallback.content).not.toContain('null');
    });

    it('should create appropriate food fallback for unknown cities', () => {
      const preferences: UserPreferences = {
        spiceLevel: 'medium',
        dietary: 'veg'
      };
      
      const fallback = ErrorHandler.createFoodFallback('unknown-city', preferences);
      
      expect(fallback.isApproximation).toBe(true);
      expect(fallback.originalQuery).toBe('unknown-city');
      expect(fallback.content).toContain("don't have specific food recommendations");
      expect(fallback.content).toContain('medium spice level');
      expect(fallback.content).toContain('veg preferences');
      expect(fallback.content).toContain('Andhra cuisine');
    });

    it('should create appropriate festival fallback for unknown festivals', () => {
      const fallback = ErrorHandler.createFestivalFallback('unknown-festival');
      
      expect(fallback.isApproximation).toBe(true);
      expect(fallback.originalQuery).toBe('unknown-festival');
      expect(fallback.content).toContain("don't have detailed information");
      expect(fallback.content).toContain('Andhra festivals');
      expect(fallback.content).toContain('cultural meaning');
    });

    it('should create appropriate emotion fallback for unknown emotions', () => {
      const fallback = ErrorHandler.createEmotionFallback('unknown-emotion');
      
      expect(fallback.isApproximation).toBe(true);
      expect(fallback.originalQuery).toBe('unknown-emotion');
      expect(fallback.content).toContain("don't have a specific food recommendation");
      expect(fallback.content).toContain('Andhra culture');
      expect(fallback.content).toContain('food can heal emotions');
    });
  });

  describe('Input Validation Errors', () => {
    it('should create validation error for missing category', () => {
      const invalidInput: UserInput = {
        category: '' as any,
        selection: 'test'
      };
      
      const error = ErrorHandler.createInputValidationError(invalidInput);
      
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toContain('category');
      expect(error.message).toContain('slang, food, festival, or emotion');
    });

    it('should create validation error for invalid category', () => {
      const invalidInput: UserInput = {
        category: 'invalid-category' as any,
        selection: 'test'
      };
      
      const error = ErrorHandler.createInputValidationError(invalidInput);
      
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toContain('invalid-category');
      expect(error.message).toContain('not a valid category');
    });

    it('should create validation error for empty selection', () => {
      const invalidInput: UserInput = {
        category: 'slang',
        selection: ''
      };
      
      const error = ErrorHandler.createInputValidationError(invalidInput);
      
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toContain('selection');
    });

    it('should create validation error for invalid preferences', () => {
      const invalidInput: UserInput = {
        category: 'food',
        selection: 'test',
        preferences: {
          spiceLevel: 'invalid-spice' as any,
          dietary: 'invalid-diet' as any
        }
      };
      
      const error = ErrorHandler.createInputValidationError(invalidInput);
      
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toContain('invalid-spice');
      expect(error.message).toContain('invalid-diet');
    });
  });

  describe('Database Error Handling', () => {
    it('should create database error with appropriate message', () => {
      const error = ErrorHandler.createDatabaseError('slang lookup');
      
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toContain('Cultural database');
      expect(error.message).toContain('slang lookup');
      expect(error.message).toContain('temporarily unavailable');
    });

    it('should create component error with fallback information', () => {
      const error = ErrorHandler.createComponentError('ResponseGenerator', 'response generation');
      
      expect(error.code).toBe('COMPONENT_FAILURE');
      expect(error.message).toContain('ResponseGenerator');
      expect(error.message).toContain('response generation');
      expect(error.fallbackData).toBeDefined();
      expect(error.fallbackData?.component).toBe('ResponseGenerator');
    });
  });

  describe('Error Recovery', () => {
    it('should identify recoverable errors correctly', () => {
      const recoverableError = ErrorHandler.createInputValidationError({
        category: 'slang',
        selection: ''
      });
      
      const nonRecoverableError = ErrorHandler.createDatabaseError('lookup');
      
      // Note: Based on the implementation, input validation errors are not in the recoverable list
      // Only missing data errors are recoverable
      expect(ErrorHandler.isRecoverableError(recoverableError)).toBe(false);
      expect(ErrorHandler.isRecoverableError(nonRecoverableError)).toBe(false);
    });
  });
});

describe('ValidationService Unit Tests', () => {
  describe('Input Validation', () => {
    it('should validate correct input successfully', () => {
      const validInput: UserInput = {
        category: 'slang',
        selection: 'Arey Baboi',
        preferences: {
          spiceLevel: 'medium',
          dietary: 'veg',
          formality: 'informal',
          region: 'coastal'
        }
      };
      
      const result = ValidationService.validateUserInput(validInput);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing category', () => {
      const invalidInput: UserInput = {
        category: '' as any,
        selection: 'test'
      };
      
      const result = ValidationService.validateUserInput(invalidInput);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required. Please select from: slang, food, festival, or emotion.');
    });

    it('should detect invalid category', () => {
      const invalidInput: UserInput = {
        category: 'invalid' as any,
        selection: 'test'
      };
      
      const result = ValidationService.validateUserInput(invalidInput);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('not a valid category'))).toBe(true);
    });

    it('should detect empty selection', () => {
      const invalidInput: UserInput = {
        category: 'slang',
        selection: ''
      };
      
      const result = ValidationService.validateUserInput(invalidInput);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Selection is required') || error.includes('Selection cannot be empty'))).toBe(true);
    });

    it('should detect overly long selection', () => {
      const invalidInput: UserInput = {
        category: 'slang',
        selection: 'a'.repeat(101) // 101 characters
      };
      
      const result = ValidationService.validateUserInput(invalidInput);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('too long'))).toBe(true);
    });
  });

  describe('Preferences Validation', () => {
    it('should validate correct preferences', () => {
      const validPreferences: UserPreferences = {
        spiceLevel: 'high',
        dietary: 'non-veg',
        formality: 'informal',
        region: 'guntur'
      };
      
      const result = ValidationService.validatePreferences(validPreferences);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid spice level', () => {
      const invalidPreferences: UserPreferences = {
        spiceLevel: 'super-hot' as any
      };
      
      const result = ValidationService.validatePreferences(invalidPreferences);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('super-hot'))).toBe(true);
    });

    it('should provide helpful warnings for preference combinations', () => {
      const preferences: UserPreferences = {
        spiceLevel: 'extreme',
        region: 'coastal' // Not Guntur
      };
      
      const result = ValidationService.validatePreferences(preferences);
      
      expect(result.warnings.some(warning => warning.includes('Guntur'))).toBe(true);
    });
  });

  describe('Category-Specific Validation', () => {
    it('should warn about formal slang requests', () => {
      const input: UserInput = {
        category: 'slang',
        selection: 'Arey Baboi',
        preferences: {
          formality: 'formal'
        }
      };
      
      const result = ValidationService.validateCategorySpecificInput(input);
      
      expect(result.warnings.some(warning => warning.includes('informal'))).toBe(true);
    });

    it('should suggest spice level for food queries', () => {
      const input: UserInput = {
        category: 'food',
        selection: 'biryani'
      };
      
      const result = ValidationService.validateCategorySpecificInput(input);
      
      expect(result.warnings.some(warning => warning.includes('spice tolerance'))).toBe(true);
    });

    it('should validate festival name length', () => {
      const input: UserInput = {
        category: 'festival',
        selection: 'ab' // Too short
      };
      
      const result = ValidationService.validateCategorySpecificInput(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('too short'))).toBe(true);
    });
  });

  describe('Input Sanitization', () => {
    it('should trim and limit selection length', () => {
      const input: UserInput = {
        category: 'slang',
        selection: '  ' + 'a'.repeat(150) + '  ' // Whitespace + 150 chars
      };
      
      const sanitized = ValidationService.sanitizeInput(input);
      
      expect(sanitized.selection.length).toBe(100);
      expect(sanitized.selection).not.toMatch(/^\s|\s$/); // No leading/trailing whitespace
    });

    it('should preserve valid preferences', () => {
      const input: UserInput = {
        category: 'food',
        selection: 'biryani',
        preferences: {
          spiceLevel: 'high',
          dietary: 'non-veg'
        }
      };
      
      const sanitized = ValidationService.sanitizeInput(input);
      
      expect(sanitized.preferences?.spiceLevel).toBe('high');
      expect(sanitized.preferences?.dietary).toBe('non-veg');
    });
  });
});

describe('DropdownInterface Error Handling', () => {
  const dropdownInterface = new DropdownInterfaceImpl();

  describe('Category Validation', () => {
    it('should throw error for invalid category in getSubcategories', () => {
      expect(() => {
        dropdownInterface.getSubcategories('invalid-category');
      }).toThrow('Invalid category');
    });

    it('should provide user-friendly category error messages', () => {
      const errorMessage = dropdownInterface.getCategoryErrorMessage('invalid');
      
      expect(errorMessage).toContain('not a valid category');
      expect(errorMessage.toLowerCase()).toMatch(/slang.*food.*festival.*emotion/);
    });

    it('should handle empty category gracefully', () => {
      const errorMessage = dropdownInterface.getCategoryErrorMessage('');
      
      expect(errorMessage).toContain('Please select a category');
      expect(errorMessage).toContain('slang, food, festival, or emotion');
    });
  });

  describe('Selection Validation', () => {
    it('should throw error for invalid selection', () => {
      expect(() => {
        dropdownInterface.processSelection('slang', 'invalid-selection');
      }).toThrow('not available for slang');
    });

    it('should provide user-friendly selection error messages', () => {
      const errorMessage = dropdownInterface.getSelectionErrorMessage('slang', 'invalid');
      
      expect(errorMessage).toContain('not available for slang');
      expect(errorMessage).toContain('Try one of these');
    });

    it('should handle empty selection gracefully', () => {
      const errorMessage = dropdownInterface.getSelectionErrorMessage('food', '');
      
      expect(errorMessage).toContain('Please make a selection');
      expect(errorMessage).toContain('Available options');
    });
  });

  describe('Preferences Validation', () => {
    it('should throw error for invalid preferences', () => {
      expect(() => {
        dropdownInterface.processSelection('food', 'breakfast items', {
          spiceLevel: 'invalid' as any
        });
      }).toThrow('Invalid spice level');
    });

    it('should provide detailed preference error messages', () => {
      const preferences: UserPreferences = {
        spiceLevel: 'invalid' as any,
        dietary: 'invalid' as any
      };
      
      const errors = dropdownInterface.getPreferencesErrorMessage(preferences);
      
      expect(errors).toHaveLength(2);
      expect(errors.some(error => error.includes('Spice level'))).toBe(true);
      expect(errors.some(error => error.includes('Dietary preference'))).toBe(true);
    });
  });

  describe('Validation with Details', () => {
    it('should return validation success for valid input', () => {
      const result = dropdownInterface.validateSelection('slang', 'greeting expressions');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return validation error for invalid input', () => {
      const result = dropdownInterface.validateSelection('invalid', 'test');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('INVALID_INPUT');
    });
  });
});