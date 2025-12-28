import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { CulturalDatabaseImpl } from './CulturalDatabaseImpl';
import { DataValidator } from './DataValidator';
import { FoodPreferences, SpiceLevel, DietaryPreference } from '../types';

describe('Cultural Database Content Validation', () => {
  let database: CulturalDatabaseImpl;

  beforeEach(() => {
    database = new CulturalDatabaseImpl();
  });

  /**
   * **Feature: andhra-local-guide, Property 10: All content derives from authorized cultural database**
   * **Validates: Requirements 8.1, 8.3**
   */
  it('should ensure all database content derives from authorized cultural database', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Test slang queries
          fc.constantFrom(...database.getAllSlangTerms()),
          // Test city queries  
          fc.constantFrom(...database.getAllCities()),
          // Test festival queries
          fc.constantFrom(...database.getAllFestivals()),
          // Test emotion queries
          fc.constantFrom(...database.getAllEmotions())
        ),
        fc.record({
          spiceLevel: fc.constantFrom('low', 'medium', 'high', 'extreme') as fc.Arbitrary<SpiceLevel>,
          dietary: fc.constantFrom('veg', 'non-veg', 'any') as fc.Arbitrary<DietaryPreference>,
          timeOfDay: fc.option(fc.constantFrom('morning', 'afternoon', 'evening', 'night')),
        }),
        (query: string, preferences: Partial<FoodPreferences>) => {
          // Determine query type and test appropriate method
          if (database.getAllSlangTerms().includes(query)) {
            const result = database.getSlangInfo(query);
            if (result) {
              // Verify slang info is valid and complete
              expect(DataValidator.validateSlangInfo(result)).toBe(true);
              expect(result.term).toBeTruthy();
              expect(result.literalMeaning).toBeTruthy();
              expect(result.emotionalIntent).toBeTruthy();
              expect(result.socialAppropriateness).toBeTruthy();
              expect(result.formalityLevel).toBeTruthy();
            }
          } else if (database.getAllCities().includes(query)) {
            const foodPrefs: FoodPreferences = {
              spiceLevel: preferences.spiceLevel || 'medium',
              dietary: preferences.dietary || 'any',
              timeOfDay: preferences.timeOfDay
            };
            const results = database.getFoodInfo(query, foodPrefs);
            
            // Verify all returned food items are valid
            results.forEach(food => {
              expect(DataValidator.validateFoodInfo(food)).toBe(true);
              expect(food.city.toLowerCase()).toBe(query.toLowerCase());
              expect(food.name).toBeTruthy();
              expect(food.description).toBeTruthy();
              expect(food.spiceLevel).toBeTruthy();
              expect(food.bestTime).toBeTruthy();
            });
          } else if (database.getAllFestivals().includes(query)) {
            const result = database.getFestivalInfo(query);
            if (result) {
              expect(DataValidator.validateFestivalInfo(result)).toBe(true);
              expect(result.name).toBeTruthy();
              expect(result.culturalMeaning).toBeTruthy();
              expect(result.associatedFoods).toBeTruthy();
              expect(result.associatedFoods.length).toBeGreaterThan(0);
              expect(result.foodSymbolism).toBeTruthy();
              expect(result.emotionalTone).toBeTruthy();
            }
          } else if (database.getAllEmotions().includes(query)) {
            const result = database.getEmotionFoodMapping(query);
            if (result) {
              expect(DataValidator.validateEmotionFoodMapping(result)).toBe(true);
              expect(result.emotion).toBeTruthy();
              expect(result.recommendedFood).toBeTruthy();
              expect(result.emotionalLogic).toBeTruthy();
              expect(result.homeVsStreet).toBeTruthy();
              expect(['home', 'street', 'both']).toContain(result.homeVsStreet);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate that database contains required cultural data completeness', () => {
    // Test that database is properly loaded
    expect(database.isDataLoaded()).toBe(true);
    
    // Test that all required slang terms are present
    const slangTerms = database.getAllSlangTerms();
    expect(slangTerms.length).toBeGreaterThan(0);
    
    // Test that all required cities have food data
    const cities = database.getAllCities();
    expect(cities).toContain('visakhapatnam');
    expect(cities).toContain('vijayawada');
    expect(cities).toContain('guntur');
    expect(cities).toContain('tirupati');
    
    // Test that all required festivals are present
    const festivals = database.getAllFestivals();
    expect(festivals).toContain('sankranti');
    expect(festivals).toContain('ugadi');
    expect(festivals).toContain('vinayaka chavithi');
    
    // Test that all required emotions are mapped
    const emotions = database.getAllEmotions();
    expect(emotions).toContain('sad');
    expect(emotions).toContain('sick');
    expect(emotions).toContain('happy');
    expect(emotions).toContain('angry');
    expect(emotions).toContain('tired');
  });

  it('should ensure no content is invented outside the authorized database', () => {
    // Test that non-existent queries return null/empty appropriately
    expect(database.getSlangInfo('non-existent-slang')).toBeNull();
    expect(database.getFoodInfo('non-existent-city', { spiceLevel: 'medium', dietary: 'any' })).toEqual([]);
    expect(database.getFestivalInfo('non-existent-festival')).toBeNull();
    expect(database.getEmotionFoodMapping('non-existent-emotion')).toBeNull();
  });

  it('should validate data structure integrity', () => {
    // Collect all data for validation
    const allSlang = database.getAllSlangTerms().map(term => database.getSlangInfo(term)).filter(Boolean);
    const allFood = database.getAllCities().flatMap(city => 
      database.getFoodInfo(city, { spiceLevel: 'extreme', dietary: 'any' })
    );
    const allFestivals = database.getAllFestivals().map(festival => database.getFestivalInfo(festival)).filter(Boolean);
    const allEmotions = database.getAllEmotions().map(emotion => database.getEmotionFoodMapping(emotion)).filter(Boolean);

    const validationResult = DataValidator.validateDataCompleteness({
      slang: allSlang,
      food: allFood,
      festivals: allFestivals,
      emotions: allEmotions
    });

    expect(validationResult.isValid).toBe(true);
    if (!validationResult.isValid) {
      console.error('Data validation errors:', validationResult.errors);
    }
  });
});