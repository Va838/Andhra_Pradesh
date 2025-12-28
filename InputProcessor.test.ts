import { describe, it, expect, beforeEach } from 'vitest';
import { InputProcessorImpl } from './InputProcessorImpl';
import { UserInput, UserPreferences } from '../types';

describe('InputProcessor Unit Tests', () => {
  let inputProcessor: InputProcessorImpl;

  beforeEach(() => {
    inputProcessor = new InputProcessorImpl();
  });

  describe('validateInput', () => {
    it('should validate valid input with all required fields', () => {
      const validInput: UserInput = {
        category: 'slang',
        selection: 'greeting expressions'
      };

      expect(inputProcessor.validateInput(validInput)).toBe(true);
    });

    it('should validate valid input with preferences', () => {
      const validInput: UserInput = {
        category: 'food',
        selection: 'street food',
        preferences: {
          spiceLevel: 'medium',
          dietary: 'veg',
          region: 'coastal'
        }
      };

      expect(inputProcessor.validateInput(validInput)).toBe(true);
    });

    it('should reject input with invalid category', () => {
      const invalidInput = {
        category: 'invalid' as any,
        selection: 'test'
      };

      expect(inputProcessor.validateInput(invalidInput)).toBe(false);
    });

    it('should reject input with empty selection', () => {
      const invalidInput: UserInput = {
        category: 'slang',
        selection: ''
      };

      expect(inputProcessor.validateInput(invalidInput)).toBe(false);
    });

    it('should reject input with whitespace-only selection', () => {
      const invalidInput: UserInput = {
        category: 'slang',
        selection: '   '
      };

      expect(inputProcessor.validateInput(invalidInput)).toBe(false);
    });

    it('should reject input with invalid spice level preference', () => {
      const invalidInput: UserInput = {
        category: 'food',
        selection: 'street food',
        preferences: {
          spiceLevel: 'invalid' as any
        }
      };

      expect(inputProcessor.validateInput(invalidInput)).toBe(false);
    });

    it('should reject input with invalid dietary preference', () => {
      const invalidInput: UserInput = {
        category: 'food',
        selection: 'street food',
        preferences: {
          dietary: 'invalid' as any
        }
      };

      expect(inputProcessor.validateInput(invalidInput)).toBe(false);
    });

    it('should reject input with invalid region preference', () => {
      const invalidInput: UserInput = {
        category: 'food',
        selection: 'street food',
        preferences: {
          region: 'invalid' as any
        }
      };

      expect(inputProcessor.validateInput(invalidInput)).toBe(false);
    });
  });

  describe('enrichInput', () => {
    it('should enrich valid input with timestamp and session ID', () => {
      const validInput: UserInput = {
        category: 'slang',
        selection: 'greeting expressions'
      };

      const enrichedInput = inputProcessor.enrichInput(validInput);

      expect(enrichedInput.category).toBe(validInput.category);
      expect(enrichedInput.selection).toBe(validInput.selection);
      expect(enrichedInput.timestamp).toBeInstanceOf(Date);
      expect(enrichedInput.sessionId).toBeDefined();
      expect(typeof enrichedInput.sessionId).toBe('string');
      expect(enrichedInput.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should preserve preferences in enriched input', () => {
      const validInput: UserInput = {
        category: 'food',
        selection: 'street food',
        preferences: {
          spiceLevel: 'high',
          dietary: 'non-veg'
        }
      };

      const enrichedInput = inputProcessor.enrichInput(validInput);

      expect(enrichedInput.preferences).toEqual(validInput.preferences);
    });

    it('should throw error for invalid input', () => {
      const invalidInput: UserInput = {
        category: 'slang',
        selection: ''
      };

      expect(() => inputProcessor.enrichInput(invalidInput)).toThrow('Invalid input provided. Please provide a selection for your chosen category.');
    });
  });

  describe('inferIntent', () => {
    it('should infer intent from valid enriched input', () => {
      const enrichedInput = {
        category: 'slang' as const,
        selection: 'greeting expressions',
        timestamp: new Date(),
        sessionId: 'test_session'
      };

      const intent = inputProcessor.inferIntent(enrichedInput);

      expect(intent.category).toBe('slang');
      expect(intent.selection).toBe('greeting expressions');
      expect(intent.preferences).toEqual({});
      expect(intent.context).toBeDefined();
      expect(intent.context.timeOfDay).toBeDefined();
      expect(['morning', 'afternoon', 'evening', 'night']).toContain(intent.context.timeOfDay);
    });

    it('should preserve preferences in intent', () => {
      const preferences: UserPreferences = {
        spiceLevel: 'medium',
        dietary: 'veg',
        region: 'guntur'
      };

      const enrichedInput = {
        category: 'food' as const,
        selection: 'street food',
        preferences,
        timestamp: new Date(),
        sessionId: 'test_session'
      };

      const intent = inputProcessor.inferIntent(enrichedInput);

      expect(intent.preferences).toEqual(preferences);
      expect(intent.context.region).toBe('guntur');
    });

    it('should infer context with region from preferences', () => {
      const enrichedInput = {
        category: 'festival' as const,
        selection: 'Ugadi',
        preferences: { region: 'coastal' as const },
        timestamp: new Date(),
        sessionId: 'test_session'
      };

      const intent = inputProcessor.inferIntent(enrichedInput);

      expect(intent.context.region).toBe('coastal');
      expect(intent.context.timeOfDay).toBeDefined();
    });

    it('should trim selection whitespace in intent', () => {
      const enrichedInput = {
        category: 'emotion' as const,
        selection: '  happy  ',
        timestamp: new Date(),
        sessionId: 'test_session'
      };

      const intent = inputProcessor.inferIntent(enrichedInput);

      expect(intent.selection).toBe('happy');
    });

    it('should throw error for invalid input', () => {
      const invalidInput = {
        category: 'slang' as const,
        selection: '',
        timestamp: new Date(),
        sessionId: 'test_session'
      };

      expect(() => inputProcessor.inferIntent(invalidInput)).toThrow('Invalid input provided. Please provide a selection for your chosen category.');
    });
  });

  describe('error handling for malformed input', () => {
    it('should handle missing category gracefully', () => {
      const malformedInput = {
        selection: 'test'
      } as UserInput;

      expect(inputProcessor.validateInput(malformedInput)).toBe(false);
    });

    it('should handle missing selection gracefully', () => {
      const malformedInput = {
        category: 'slang'
      } as UserInput;

      expect(inputProcessor.validateInput(malformedInput)).toBe(false);
    });

    it('should handle null preferences gracefully', () => {
      const inputWithNullPrefs = {
        category: 'slang' as const,
        selection: 'test',
        preferences: null as any
      };

      expect(inputProcessor.validateInput(inputWithNullPrefs)).toBe(true);
    });
  });
});