import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { EmotionFoodMapperImpl } from './EmotionFoodMapperImpl';
import { UserPreferences, SpiceLevel, DietaryPreference, Region } from '../types';

describe('EmotionFoodMapper Property Tests', () => {
  const emotionMapper = new EmotionFoodMapperImpl();

  /**
   * **Feature: andhra-local-guide, Property 5: Emotion queries return food recommendations with reasoning**
   * **Validates: Requirements 1.5**
   */
  it('should return food recommendations with reasoning for any emotion input', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (emotion: string) => {
          // Act
          const recommendation = emotionMapper.mapEmotionToFood(emotion);
          
          // Assert - recommendation should have all required fields
          expect(recommendation).toBeDefined();
          expect(typeof recommendation.food).toBe('string');
          expect(recommendation.food.trim().length).toBeGreaterThan(0);
          
          expect(typeof recommendation.reasoning).toBe('string');
          expect(recommendation.reasoning.trim().length).toBeGreaterThan(0);
          
          expect(typeof recommendation.culturalContext).toBe('string');
          expect(recommendation.culturalContext.trim().length).toBeGreaterThan(0);
          
          expect(['low', 'medium', 'high', 'extreme']).toContain(recommendation.spiceLevel);
          
          // Reasoning should provide emotional logic
          expect(
            recommendation.reasoning.length > 10 || 
            recommendation.culturalContext.includes('Andhra')
          ).toBe(true);
          
          // Cultural context should reference Andhra culture
          expect(
            recommendation.culturalContext.toLowerCase().includes('andhra') ||
            recommendation.culturalContext.toLowerCase().includes('culture')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide emotional logic explanations for any emotion-food combination', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (emotion: string, food: string) => {
          // Act
          const explanation = emotionMapper.explainEmotionalLogic(emotion, food);
          
          // Assert
          expect(typeof explanation).toBe('string');
          expect(explanation.trim().length).toBeGreaterThan(0);
          
          // Explanation should reference the emotion or provide cultural context
          const lowerExplanation = explanation.toLowerCase();
          expect(
            lowerExplanation.includes(emotion.toLowerCase()) ||
            lowerExplanation.includes('mood') ||
            lowerExplanation.includes('andhra') ||
            lowerExplanation.includes('culture')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should adapt recommendations based on user preferences', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('sad', 'happy', 'angry', 'tired', 'sick'),
        fc.record({
          spiceLevel: fc.option(fc.constantFrom('low', 'medium', 'high', 'extreme') as fc.Arbitrary<SpiceLevel>),
          dietary: fc.option(fc.constantFrom('veg', 'non-veg', 'any') as fc.Arbitrary<DietaryPreference>),
          region: fc.option(fc.constantFrom('coastal', 'guntur', 'rayalaseema') as fc.Arbitrary<Region>)
        }),
        (emotion: string, preferences: UserPreferences) => {
          // Act
          const baseRecommendation = emotionMapper.mapEmotionToFood(emotion);
          const adaptedRecommendation = emotionMapper.considerPreferences(baseRecommendation, preferences);
          
          // Assert
          expect(adaptedRecommendation).toBeDefined();
          expect(typeof adaptedRecommendation.food).toBe('string');
          expect(adaptedRecommendation.food.trim().length).toBeGreaterThan(0);
          
          // If spice level preference is provided, adapted recommendation should reflect it
          if (preferences.spiceLevel) {
            expect(adaptedRecommendation.spiceLevel).toBe(preferences.spiceLevel);
          }
          
          // If dietary preference is vegetarian, food should be adapted accordingly
          if (preferences.dietary === 'veg') {
            const foodLower = adaptedRecommendation.food.toLowerCase();
            expect(
              !foodLower.includes('chicken') && 
              !foodLower.includes('mutton') && 
              !foodLower.includes('fish') &&
              !foodLower.includes('meat')
            ).toBe(true);
          }
          
          // Reasoning should still be present and meaningful
          expect(typeof adaptedRecommendation.reasoning).toBe('string');
          expect(adaptedRecommendation.reasoning.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});