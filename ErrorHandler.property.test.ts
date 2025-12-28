import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ErrorHandler } from './ErrorHandler';
import { CulturalDatabaseImpl } from '../data/CulturalDatabaseImpl';
import { UserPreferences, FoodPreferences } from '../types';

/**
 * **Feature: andhra-local-guide, Property 11: Missing information triggers appropriate fallbacks**
 * **Validates: Requirements 8.2**
 * 
 * Property-based test to verify that when cultural information is missing,
 * the system returns appropriate fallback responses rather than errors.
 */
describe('ErrorHandler Property Tests', () => {
  const culturalDatabase = new CulturalDatabaseImpl();

  it('Property 11: Missing information triggers appropriate fallbacks', () => {
    fc.assert(
      fc.property(
        // Generate random queries that are likely to be missing from the database
        fc.record({
          slangTerm: fc.string({ minLength: 3, maxLength: 20 }).filter(s => !s.match(/^(arey|baboi|lite|doola|taggede|chala)/i)),
          city: fc.string({ minLength: 3, maxLength: 15 }).filter(s => !s.match(/^(visakhapatnam|vijayawada|guntur|tirupati|vizag)/i)),
          festival: fc.string({ minLength: 3, maxLength: 20 }).filter(s => !s.match(/^(sankranti|ugadi|vinayaka)/i)),
          emotion: fc.string({ minLength: 3, maxLength: 15 }).filter(s => !s.match(/^(sad|sick|happy|angry|tired)/i)),
          preferences: fc.record({
            spiceLevel: fc.constantFrom('low', 'medium', 'high', 'extreme'),
            dietary: fc.constantFrom('veg', 'non-veg', 'any'),
            formality: fc.constantFrom('formal', 'informal'),
            region: fc.constantFrom('coastal', 'guntur', 'rayalaseema')
          }, { requiredKeys: ['spiceLevel', 'dietary'] })
        }),
        (testData) => {
          // Test slang fallback
          const slangResult = culturalDatabase.getSlangInfoWithFallback(testData.slangTerm);
          if ('isApproximation' in slangResult) {
            // Should be a fallback response
            expect(slangResult.isApproximation).toBe(true);
            expect(slangResult.content).toContain("don't have specific information");
            expect(slangResult.originalQuery).toBe(testData.slangTerm);
            expect(slangResult.fallbackReason).toContain('not found');
          }

          // Test food fallback
          const foodPreferences: FoodPreferences = {
            spiceLevel: testData.preferences.spiceLevel,
            dietary: testData.preferences.dietary,
            region: testData.preferences.region
          };
          const foodResult = culturalDatabase.getFoodInfoWithFallback(testData.city, foodPreferences);
          if ('isApproximation' in foodResult) {
            // Should be a fallback response
            expect(foodResult.isApproximation).toBe(true);
            expect(foodResult.content).toContain("don't have specific food recommendations");
            expect(foodResult.originalQuery).toBe(testData.city);
            expect(foodResult.fallbackReason).toContain('not found');
          }

          // Test festival fallback
          const festivalResult = culturalDatabase.getFestivalInfoWithFallback(testData.festival);
          if ('isApproximation' in festivalResult) {
            // Should be a fallback response
            expect(festivalResult.isApproximation).toBe(true);
            expect(festivalResult.content).toContain("don't have detailed information");
            expect(festivalResult.originalQuery).toBe(testData.festival);
            expect(festivalResult.fallbackReason).toContain('not found');
          }

          // Test emotion fallback
          const emotionResult = culturalDatabase.getEmotionFoodMappingWithFallback(testData.emotion);
          if ('isApproximation' in emotionResult) {
            // Should be a fallback response
            expect(emotionResult.isApproximation).toBe(true);
            expect(emotionResult.content).toContain("don't have a specific food recommendation");
            expect(emotionResult.originalQuery).toBe(testData.emotion);
            expect(emotionResult.fallbackReason).toContain('not found');
          }

          // All fallback responses should maintain cultural authenticity
          const allFallbacks = [slangResult, foodResult, festivalResult, emotionResult]
            .filter(result => 'isApproximation' in result);
          
          allFallbacks.forEach(fallback => {
            // Should contain Andhra cultural references
            expect(fallback.content.toLowerCase()).toMatch(/andhra|cultural|authentic|traditional/);
            // Should provide helpful suggestions
            expect(fallback.content).toMatch(/try|ask|explore|popular/i);
            // Should not contain technical terms
            expect(fallback.content.toLowerCase()).not.toMatch(/api|database|system|error|null|undefined/);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Fallback responses maintain cultural tone', () => {
    fc.assert(
      fc.property(
        fc.record({
          invalidTerm: fc.string({ minLength: 1, maxLength: 30 }),
          preferences: fc.record({
            spiceLevel: fc.constantFrom('low', 'medium', 'high', 'extreme'),
            dietary: fc.constantFrom('veg', 'non-veg', 'any')
          })
        }),
        (testData) => {
          // Test that all fallback methods maintain cultural authenticity
          const slangFallback = ErrorHandler.createSlangFallback(testData.invalidTerm);
          const foodFallback = ErrorHandler.createFoodFallback(testData.invalidTerm, testData.preferences);
          const festivalFallback = ErrorHandler.createFestivalFallback(testData.invalidTerm);
          const emotionFallback = ErrorHandler.createEmotionFallback(testData.invalidTerm);

          const allFallbacks = [slangFallback, foodFallback, festivalFallback, emotionFallback];

          allFallbacks.forEach(fallback => {
            // Should be marked as approximation
            expect(fallback.isApproximation).toBe(true);
            
            // Should contain the original query
            expect(fallback.originalQuery).toBe(testData.invalidTerm);
            
            // Should have a clear fallback reason
            expect(fallback.fallbackReason).toBeTruthy();
            expect(fallback.fallbackReason.length).toBeGreaterThan(0);
            
            // Should maintain warm, cultural tone
            expect(fallback.content).not.toContain('error');
            expect(fallback.content).not.toContain('failed');
            expect(fallback.content).not.toContain('null');
            
            // Should provide helpful guidance
            expect(fallback.content.toLowerCase()).toMatch(/try|ask|explore|popular|authentic|andhra/);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property: Input validation errors are user-friendly', () => {
    fc.assert(
      fc.property(
        fc.record({
          category: fc.option(fc.constantFrom('slang', 'food', 'festival', 'emotion', 'invalid'), { nil: null }),
          selection: fc.option(fc.string({ maxLength: 50 }), { nil: null }),
          preferences: fc.option(fc.record({
            spiceLevel: fc.option(fc.constantFrom('low', 'medium', 'high', 'extreme', 'invalid'), { nil: undefined }),
            dietary: fc.option(fc.constantFrom('veg', 'non-veg', 'any', 'invalid'), { nil: undefined }),
            formality: fc.option(fc.constantFrom('formal', 'informal', 'invalid'), { nil: undefined }),
            region: fc.option(fc.constantFrom('coastal', 'guntur', 'rayalaseema', 'invalid'), { nil: undefined })
          }), { nil: undefined })
        }),
        (invalidInput) => {
          // Create input validation error
          const error = ErrorHandler.createInputValidationError(invalidInput as any);
          
          // Error should have proper structure
          expect(error.code).toBe('INVALID_INPUT');
          expect(error.message).toBeTruthy();
          expect(error.message.length).toBeGreaterThan(0);
          
          // Error message should be user-friendly (no technical jargon)
          expect(error.message.toLowerCase()).not.toMatch(/null|undefined|exception|stack|trace/);
          
          // Should provide clear guidance
          expect(error.message).toMatch(/please|select|provide|choose|valid/i);
          
          // Should mention specific validation issues
          if (!invalidInput.category || invalidInput.category === 'invalid') {
            expect(error.message).toMatch(/category/i);
          }
          if (!invalidInput.selection || invalidInput.selection?.trim() === '') {
            expect(error.message).toMatch(/selection/i);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});