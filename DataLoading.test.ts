import { describe, it, expect, beforeEach } from 'vitest';
import { ProductMdParser } from './ProductMdParser';
import { DataValidator } from './DataValidator';
import { CulturalDatabaseImpl } from './CulturalDatabaseImpl';
import { SlangInfo, FoodInfo, FestivalInfo, EmotionFoodMapping } from '../types';

describe('Data Loading and Validation', () => {
  let parser: ProductMdParser;
  let database: CulturalDatabaseImpl;

  beforeEach(() => {
    parser = new ProductMdParser();
    database = new CulturalDatabaseImpl();
  });

  describe('ProductMdParser', () => {
    it('should handle missing product.md file gracefully', () => {
      const invalidParser = new ProductMdParser('non-existent-file.md');
      expect(() => invalidParser.parseProductMd()).toThrow('Failed to read product.md');
    });

    it('should parse valid slang data correctly', () => {
      const mockContent = `
🗣️ Andhra Slang Intelligence

"Arey Baboi"
Literal: Oh my God
Emotional meaning: Shock / frustration / disbelief
Usage: Informal
Avoid in formal settings
      `;
      
      const result = parser['parseContent'](mockContent);
      expect(result.slang).toHaveLength(1);
      expect(result.slang[0].term).toBe('Arey Baboi');
      expect(result.slang[0].literalMeaning).toBe('Oh my God');
      expect(result.slang[0].emotionalIntent).toBe('Shock / frustration / disbelief');
    });

    it('should parse valid food data correctly', () => {
      const mockContent = `
🍗 Andhra Street Food Culture

Visakhapatnam (Vizag)
Punugulu → medium spice
Bongulo Chicken → high spice
      `;
      
      const result = parser['parseContent'](mockContent);
      expect(result.food).toHaveLength(2);
      expect(result.food[0].name).toBe('Punugulu');
      expect(result.food[0].city).toBe('Visakhapatnam');
      expect(result.food[0].spiceLevel).toBe('medium');
    });

    it('should parse valid festival data correctly', () => {
      const mockContent = `
🎉 Festivals of Andhra Pradesh

Sankranti
Harvest festival celebrating abundance
Foods: Ariselu, Pongal
Emotional tone: Family bonding
      `;
      
      const result = parser['parseContent'](mockContent);
      expect(result.festivals).toHaveLength(1);
      expect(result.festivals[0].name).toBe('Sankranti');
      expect(result.festivals[0].associatedFoods).toContain('Ariselu');
      expect(result.festivals[0].emotionalTone).toBe('Family bonding');
    });

    it('should parse valid emotion-food mappings correctly', () => {
      const mockContent = `
❤️ Emotional Food Mapping

Sad → Pappu + Avakaya
(Comfort, nostalgia)

Happy → Biryani
(Celebration)
      `;
      
      const result = parser['parseContent'](mockContent);
      expect(result.emotions).toHaveLength(2);
      expect(result.emotions[0].emotion).toBe('sad');
      expect(result.emotions[0].recommendedFood).toBe('Pappu + Avakaya');
      expect(result.emotions[0].emotionalLogic).toBe('Comfort, nostalgia');
    });

    it('should handle malformed data gracefully', () => {
      const malformedContent = `
🗣️ Andhra Slang Intelligence

"Incomplete Entry"
Missing required fields
      `;
      
      const result = parser['parseContent'](malformedContent);
      // Should return empty arrays for malformed data
      expect(result.slang).toHaveLength(0);
    });
  });

  describe('DataValidator', () => {
    it('should validate complete SlangInfo correctly', () => {
      const validSlang: SlangInfo = {
        term: 'Test Term',
        literalMeaning: 'Test Meaning',
        emotionalIntent: 'Test Intent',
        socialAppropriateness: 'Test Usage',
        formalityLevel: 'informal'
      };
      
      expect(DataValidator.validateSlangInfo(validSlang)).toBe(true);
    });

    it('should reject incomplete SlangInfo', () => {
      const incompleteSlang = {
        term: 'Test Term',
        literalMeaning: 'Test Meaning'
        // Missing required fields
      };
      
      expect(DataValidator.validateSlangInfo(incompleteSlang as any)).toBe(false);
    });

    it('should validate complete FoodInfo correctly', () => {
      const validFood: FoodInfo = {
        name: 'Test Food',
        city: 'Test City',
        spiceLevel: 'medium',
        bestTime: 'Evening',
        description: 'Test Description'
      };
      
      expect(DataValidator.validateFoodInfo(validFood)).toBe(true);
    });

    it('should reject FoodInfo with invalid spice level', () => {
      const invalidFood = {
        name: 'Test Food',
        city: 'Test City',
        spiceLevel: 'invalid-level',
        bestTime: 'Evening',
        description: 'Test Description'
      };
      
      expect(DataValidator.validateFoodInfo(invalidFood as any)).toBe(false);
    });

    it('should validate complete FestivalInfo correctly', () => {
      const validFestival: FestivalInfo = {
        name: 'Test Festival',
        culturalMeaning: 'Test Meaning',
        associatedFoods: ['Food1', 'Food2'],
        foodSymbolism: 'Test Symbolism',
        emotionalTone: 'Test Tone'
      };
      
      expect(DataValidator.validateFestivalInfo(validFestival)).toBe(true);
    });

    it('should reject FestivalInfo with empty associated foods', () => {
      const invalidFestival = {
        name: 'Test Festival',
        culturalMeaning: 'Test Meaning',
        associatedFoods: [],
        foodSymbolism: 'Test Symbolism',
        emotionalTone: 'Test Tone'
      };
      
      expect(DataValidator.validateFestivalInfo(invalidFestival as any)).toBe(false);
    });

    it('should validate complete EmotionFoodMapping correctly', () => {
      const validMapping: EmotionFoodMapping = {
        emotion: 'happy',
        recommendedFood: 'Test Food',
        emotionalLogic: 'Test Logic',
        homeVsStreet: 'both'
      };
      
      expect(DataValidator.validateEmotionFoodMapping(validMapping)).toBe(true);
    });

    it('should reject EmotionFoodMapping with invalid homeVsStreet', () => {
      const invalidMapping = {
        emotion: 'happy',
        recommendedFood: 'Test Food',
        emotionalLogic: 'Test Logic',
        homeVsStreet: 'invalid-option'
      };
      
      expect(DataValidator.validateEmotionFoodMapping(invalidMapping as any)).toBe(false);
    });

    it('should validate data completeness correctly', () => {
      const completeData = {
        slang: [
          {
            term: 'Test',
            literalMeaning: 'Test',
            emotionalIntent: 'Test',
            socialAppropriateness: 'Test',
            formalityLevel: 'informal'
          } as SlangInfo
        ],
        food: [
          {
            name: 'Test Food',
            city: 'visakhapatnam',
            spiceLevel: 'medium',
            bestTime: 'Evening',
            description: 'Test'
          } as FoodInfo,
          {
            name: 'Test Food 2',
            city: 'vijayawada',
            spiceLevel: 'medium',
            bestTime: 'Evening',
            description: 'Test'
          } as FoodInfo,
          {
            name: 'Test Food 3',
            city: 'guntur',
            spiceLevel: 'medium',
            bestTime: 'Evening',
            description: 'Test'
          } as FoodInfo,
          {
            name: 'Test Food 4',
            city: 'tirupati',
            spiceLevel: 'medium',
            bestTime: 'Evening',
            description: 'Test'
          } as FoodInfo
        ],
        festivals: [
          {
            name: 'Test Festival',
            culturalMeaning: 'Test',
            associatedFoods: ['Food1'],
            foodSymbolism: 'Test',
            emotionalTone: 'Test'
          } as FestivalInfo
        ],
        emotions: [
          { emotion: 'sad', recommendedFood: 'Food', emotionalLogic: 'Logic', homeVsStreet: 'home' } as EmotionFoodMapping,
          { emotion: 'sick', recommendedFood: 'Food', emotionalLogic: 'Logic', homeVsStreet: 'home' } as EmotionFoodMapping,
          { emotion: 'happy', recommendedFood: 'Food', emotionalLogic: 'Logic', homeVsStreet: 'both' } as EmotionFoodMapping,
          { emotion: 'angry', recommendedFood: 'Food', emotionalLogic: 'Logic', homeVsStreet: 'home' } as EmotionFoodMapping,
          { emotion: 'tired', recommendedFood: 'Food', emotionalLogic: 'Logic', homeVsStreet: 'street' } as EmotionFoodMapping
        ]
      };
      
      const result = DataValidator.validateDataCompleteness(completeData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required emotions', () => {
      const incompleteData = {
        slang: [],
        food: [],
        festivals: [],
        emotions: [
          { emotion: 'happy', recommendedFood: 'Food', emotionalLogic: 'Logic', homeVsStreet: 'both' } as EmotionFoodMapping
          // Missing sad, sick, angry, tired
        ]
      };
      
      const result = DataValidator.validateDataCompleteness(incompleteData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required emotion mapping: sad');
      expect(result.errors).toContain('Missing required emotion mapping: sick');
      expect(result.errors).toContain('Missing required emotion mapping: angry');
      expect(result.errors).toContain('Missing required emotion mapping: tired');
    });

    it('should detect missing required cities', () => {
      const incompleteData = {
        slang: [],
        food: [
          {
            name: 'Test Food',
            city: 'visakhapatnam',
            spiceLevel: 'medium',
            bestTime: 'Evening',
            description: 'Test'
          } as FoodInfo
          // Missing vijayawada, guntur, tirupati
        ],
        festivals: [],
        emotions: []
      };
      
      const result = DataValidator.validateDataCompleteness(incompleteData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing food data for required city: vijayawada');
      expect(result.errors).toContain('Missing food data for required city: guntur');
      expect(result.errors).toContain('Missing food data for required city: tirupati');
    });
  });

  describe('CulturalDatabaseImpl Error Handling', () => {
    it('should handle database loading errors gracefully', () => {
      // Test with invalid path to trigger fallback
      const dbWithInvalidPath = new CulturalDatabaseImpl('invalid-path.md');
      
      // Should still be loaded (using fallback data)
      expect(dbWithInvalidPath.isDataLoaded()).toBe(true);
      
      // Should have some data from fallback
      expect(dbWithInvalidPath.getAllSlangTerms().length).toBeGreaterThan(0);
      expect(dbWithInvalidPath.getAllCities().length).toBeGreaterThan(0);
      expect(dbWithInvalidPath.getAllFestivals().length).toBeGreaterThan(0);
      expect(dbWithInvalidPath.getAllEmotions().length).toBeGreaterThan(0);
    });

    it('should validate individual data items during loading', () => {
      // The database should validate each item and only include valid ones
      expect(database.getAllSlangTerms().length).toBeGreaterThan(0);
      
      // Test that all loaded slang items are valid
      database.getAllSlangTerms().forEach(term => {
        const slangInfo = database.getSlangInfo(term);
        expect(slangInfo).not.toBeNull();
        if (slangInfo) {
          expect(DataValidator.validateSlangInfo(slangInfo)).toBe(true);
        }
      });
    });

    it('should handle queries for non-existent data appropriately', () => {
      expect(database.getSlangInfo('non-existent-term')).toBeNull();
      expect(database.getFoodInfo('non-existent-city', { spiceLevel: 'medium', dietary: 'any' })).toEqual([]);
      expect(database.getFestivalInfo('non-existent-festival')).toBeNull();
      expect(database.getEmotionFoodMapping('non-existent-emotion')).toBeNull();
    });

    it('should filter food results based on preferences correctly', () => {
      const allFoods = database.getFoodInfo('guntur', { spiceLevel: 'extreme', dietary: 'any' });
      const lowSpiceFoods = database.getFoodInfo('guntur', { spiceLevel: 'low', dietary: 'any' });
      
      // Low spice tolerance should return fewer or equal items
      expect(lowSpiceFoods.length).toBeLessThanOrEqual(allFoods.length);
      
      // All returned items should have appropriate spice level
      lowSpiceFoods.forEach(food => {
        const spiceLevels = { 'low': 1, 'medium': 2, 'high': 3, 'extreme': 4 };
        expect(spiceLevels[food.spiceLevel as keyof typeof spiceLevels]).toBeLessThanOrEqual(1);
      });
    });
  });
});