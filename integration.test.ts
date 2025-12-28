import { describe, it, expect, beforeEach } from 'vitest';
import { AndhraCulturalGuide } from '../AndhraCulturalGuide';
import { UserPreferences, Category } from '../types';

/**
 * Integration tests for end-to-end workflows
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Complete user workflows from dropdown selection to response
 */
describe('AndhraCulturalGuide Integration Tests', () => {
  let guide: AndhraCulturalGuide;

  beforeEach(() => {
    guide = new AndhraCulturalGuide();
  });

  describe('System Initialization', () => {
    it('should initialize all components successfully', () => {
      expect(guide.isReady()).toBe(true);
      
      const status = guide.getSystemStatus();
      expect(status.isReady).toBe(true);
      expect(status.components.dropdownInterface).toBe(true);
      expect(status.components.inputProcessor).toBe(true);
      expect(status.components.responseGenerator).toBe(true);
      expect(status.components.culturalDatabase).toBe(true);
    });

    it('should provide valid categories and subcategories', () => {
      const categories = guide.getCategories();
      expect(categories).toEqual(['slang', 'food', 'festival', 'emotion']);

      categories.forEach(category => {
        const subcategories = guide.getSubcategories(category);
        expect(subcategories.length).toBeGreaterThan(0);
        expect(Array.isArray(subcategories)).toBe(true);
      });
    });
  });

  describe('End-to-End Slang Workflow', () => {
    it('should handle complete slang query workflow', async () => {
      // Test Requirements: 1.2 - Slang category responses
      const category = 'slang';
      const selection = 'greeting expressions';
      const preferences: UserPreferences = {
        formality: 'informal',
        region: 'coastal'
      };

      // Step 1: Validate selection
      const validation = guide.validateSelection(category, selection, preferences);
      expect(validation.isValid).toBe(true);

      // Step 2: Get cultural guidance
      const result = await guide.getCulturalGuidance(category, selection, preferences);
      expect(result.error).toBeUndefined();
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
      expect(result.response.length).toBeGreaterThan(0);

      // Step 3: Validate response quality
      const quality = guide.validateResponseQuality(result.response);
      expect(quality.isValid).toBe(true);
      expect(quality.issues.length).toBe(0);
    });

    it('should handle slang queries with different regional preferences', async () => {
      const category = 'slang';
      const selection = 'emotional expressions';
      
      const regions: Array<'coastal' | 'guntur' | 'rayalaseema'> = ['coastal', 'guntur', 'rayalaseema'];
      
      for (const region of regions) {
        const preferences: UserPreferences = { region };
        const result = await guide.getCulturalGuidance(category, selection, preferences);
        
        expect(result.error).toBeUndefined();
        expect(result.response).toBeDefined();
        expect(result.response.length).toBeGreaterThan(0);
        
        // Response should reflect regional characteristics
        expect(result.response).toMatch(/\b(trust|pakka|simple|arey|baboi)\b/i);
      }
    });
  });

  describe('End-to-End Food Workflow', () => {
    it('should handle complete food query workflow', async () => {
      // Test Requirements: 1.3 - Food category responses
      const category = 'food';
      const selection = 'street food';
      const preferences: UserPreferences = {
        spiceLevel: 'medium',
        dietary: 'veg',
        region: 'guntur'
      };

      // Step 1: Validate selection
      const validation = guide.validateSelection(category, selection, preferences);
      expect(validation.isValid).toBe(true);

      // Step 2: Get cultural guidance
      const result = await guide.getCulturalGuidance(category, selection, preferences);
      expect(result.error).toBeUndefined();
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
      expect(result.response.length).toBeGreaterThan(0);

      // Step 3: Validate response includes food-related content
      expect(result.response).toMatch(/\b(food|eat|taste|spice|flavor)\b/i);
      
      // Step 4: Validate response quality
      const quality = guide.validateResponseQuality(result.response);
      expect(quality.isValid).toBe(true);
    });

    it('should handle food queries with different spice preferences', async () => {
      const category = 'food';
      const selection = 'breakfast items';
      
      const spiceLevels: Array<'low' | 'medium' | 'high' | 'extreme'> = ['low', 'medium', 'high', 'extreme'];
      
      for (const spiceLevel of spiceLevels) {
        const preferences: UserPreferences = { spiceLevel };
        const result = await guide.getCulturalGuidance(category, selection, preferences);
        
        expect(result.error).toBeUndefined();
        expect(result.response).toBeDefined();
        expect(result.response.length).toBeGreaterThan(0);
      }
    });
  });

  describe('End-to-End Festival Workflow', () => {
    it('should handle complete festival query workflow', async () => {
      // Test Requirements: 1.4 - Festival category responses
      const category = 'festival';
      const selection = 'Ugadi';
      const preferences: UserPreferences = {
        region: 'rayalaseema'
      };

      // Step 1: Validate selection
      const validation = guide.validateSelection(category, selection, preferences);
      expect(validation.isValid).toBe(true);

      // Step 2: Get cultural guidance
      const result = await guide.getCulturalGuidance(category, selection, preferences);
      expect(result.error).toBeUndefined();
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
      expect(result.response.length).toBeGreaterThan(0);

      // Step 3: Validate response includes festival-related content
      expect(result.response).toMatch(/\b(festival|celebration|tradition|culture)\b/i);
      
      // Step 4: Validate response quality
      const quality = guide.validateResponseQuality(result.response);
      expect(quality.isValid).toBe(true);
    });

    it('should handle different festival selections', async () => {
      const category = 'festival';
      const festivals = ['Ugadi', 'Sankranti', 'Dussehra'];
      
      for (const festival of festivals) {
        const result = await guide.getCulturalGuidance(category, festival);
        
        expect(result.error).toBeUndefined();
        expect(result.response).toBeDefined();
        expect(result.response.length).toBeGreaterThan(0);
        expect(result.response).toMatch(/\b(festival|celebration|tradition)\b/i);
      }
    });
  });

  describe('End-to-End Emotion Workflow', () => {
    it('should handle complete emotion query workflow', async () => {
      // Test Requirements: 1.5 - Emotion category responses
      const category = 'emotion';
      const selection = 'sad';
      const preferences: UserPreferences = {
        spiceLevel: 'low',
        dietary: 'veg'
      };

      // Step 1: Validate selection
      const validation = guide.validateSelection(category, selection, preferences);
      expect(validation.isValid).toBe(true);

      // Step 2: Get cultural guidance
      const result = await guide.getCulturalGuidance(category, selection, preferences);
      expect(result.error).toBeUndefined();
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
      expect(result.response.length).toBeGreaterThan(0);

      // Step 3: Validate response includes emotion and food content
      expect(result.response).toMatch(/\b(food|comfort|feel|emotion)\b/i);
      
      // Step 4: Validate response quality
      const quality = guide.validateResponseQuality(result.response);
      expect(quality.isValid).toBe(true);
    });

    it('should handle different emotional states', async () => {
      const category = 'emotion';
      const emotions = ['happy', 'sad', 'angry', 'tired'];
      
      for (const emotion of emotions) {
        const result = await guide.getCulturalGuidance(category, emotion);
        
        expect(result.error).toBeUndefined();
        expect(result.response).toBeDefined();
        expect(result.response.length).toBeGreaterThan(0);
        expect(result.response).toMatch(/\b(food|feel|emotion)\b/i);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid category gracefully', async () => {
      const result = await guide.getCulturalGuidance('invalid', 'test');
      
      expect(result.error).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.response).toMatch(/\b(arey|baboi|sorry)\b/i);
      expect(result.response).toMatch(/\b(slang|food|festival|emotion)\b/i);
    });

    it('should handle invalid selection gracefully', async () => {
      const result = await guide.getCulturalGuidance('slang', 'invalid selection');
      
      expect(result.error).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.response).toMatch(/\b(arey|baboi|sorry)\b/i);
    });

    it('should handle empty selection gracefully', async () => {
      const result = await guide.getCulturalGuidance('food', '');
      
      expect(result.error).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.response).toMatch(/\b(arey|baboi|sorry)\b/i);
    });

    it('should provide helpful suggestions for errors', async () => {
      const result = await guide.getCulturalGuidance('slang', 'nonexistent');
      
      expect(result.response).toMatch(/\b(try|asking|about)\b/i);
      expect(result.response).toMatch(/\b(greeting|emotional|casual)\b/i);
    });
  });

  describe('Response Consistency Integration', () => {
    it('should maintain consistent response structure across categories', async () => {
      const testCases = [
        { category: 'slang', selection: 'greeting expressions' },
        { category: 'food', selection: 'street food' },
        { category: 'festival', selection: 'Ugadi' },
        { category: 'emotion', selection: 'happy' }
      ];

      for (const testCase of testCases) {
        const result = await guide.getCulturalGuidance(testCase.category, testCase.selection);
        
        expect(result.error).toBeUndefined();
        expect(result.response).toBeDefined();
        
        // All responses should have cultural warmth
        expect(result.response).toMatch(/\b(trust|you know|let me|pakka|believe|honestly|arey|baboi)\b/i);
        
        // All responses should end with proper punctuation
        expect(result.response).toMatch(/[.!?]$/);
        
        // All responses should have reasonable length
        expect(result.response.length).toBeGreaterThan(50);
        expect(result.response.length).toBeLessThan(1000);
      }
    });

    it('should include Telugu vocabulary in all responses', async () => {
      const testCases = [
        { category: 'slang', selection: 'casual conversation' },
        { category: 'food', selection: 'snacks' },
        { category: 'festival', selection: 'Sankranti' },
        { category: 'emotion', selection: 'excited' }
      ];

      const teluguWords = ['babu', 'amma', 'arey', 'baboi', 'pappu', 'avakaya', 'rasam', 'biryani', 'panduga', 'santosham'];

      for (const testCase of testCases) {
        const result = await guide.getCulturalGuidance(testCase.category, testCase.selection);
        
        expect(result.error).toBeUndefined();
        
        // Should contain at least one Telugu word
        const hasTeluguWord = teluguWords.some(word => 
          result.response.toLowerCase().includes(word.toLowerCase())
        );
        expect(hasTeluguWord).toBe(true);
      }
    });

    it('should avoid technical terms in all responses', async () => {
      const testCases = [
        { category: 'slang', selection: 'family terms' },
        { category: 'food', selection: 'main meals' },
        { category: 'festival', selection: 'Diwali' },
        { category: 'emotion', selection: 'stressed' }
      ];

      const technicalTerms = ['API', 'database', 'dataset', 'training', 'algorithm', 'system', 'interface'];

      for (const testCase of testCases) {
        const result = await guide.getCulturalGuidance(testCase.category, testCase.selection);
        
        expect(result.error).toBeUndefined();
        
        // Should not contain technical terms
        const hasTechnicalTerms = technicalTerms.some(term => 
          result.response.toLowerCase().includes(term.toLowerCase())
        );
        expect(hasTechnicalTerms).toBe(false);
      }
    });
  });

  describe('Preference Integration', () => {
    it('should handle complex preference combinations', async () => {
      const complexPreferences: UserPreferences = {
        spiceLevel: 'extreme',
        dietary: 'non-veg',
        formality: 'informal',
        region: 'guntur'
      };

      const testCases = [
        { category: 'food', selection: 'street food' },
        { category: 'slang', selection: 'casual conversation' },
        { category: 'emotion', selection: 'angry' }
      ];

      for (const testCase of testCases) {
        const result = await guide.getCulturalGuidance(testCase.category, testCase.selection, complexPreferences);
        
        expect(result.error).toBeUndefined();
        expect(result.response).toBeDefined();
        expect(result.response.length).toBeGreaterThan(0);
        
        // Should reflect Guntur regional characteristics
        if (testCase.category === 'food' || testCase.category === 'slang') {
          expect(result.response).toMatch(/\b(pakka|fire|bold|extreme)\b/i);
        }
      }
    });

    it('should validate preferences correctly', () => {
      const invalidPreferences: UserPreferences = {
        spiceLevel: 'invalid' as any,
        dietary: 'invalid' as any,
        region: 'invalid' as any
      };

      const validation = guide.validateSelection('food', 'street food', invalidPreferences);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });
  });

  describe('Category Information Integration', () => {
    it('should provide comprehensive category information', () => {
      const categories: Category[] = ['slang', 'food', 'festival', 'emotion'];
      
      for (const category of categories) {
        const info = guide.getCategoryInfo(category);
        
        expect(info.subcategories).toBeDefined();
        expect(info.subcategories.length).toBeGreaterThan(0);
        expect(info.description).toBeDefined();
        expect(info.description.length).toBeGreaterThan(0);
        expect(info.availablePreferences).toBeDefined();
        expect(Array.isArray(info.availablePreferences)).toBe(true);
      }
    });

    it('should provide helpful suggestions for failed queries', () => {
      const categories: Category[] = ['slang', 'food', 'festival', 'emotion'];
      
      for (const category of categories) {
        const suggestions = guide.getSuggestions(category, 'nonexistent');
        
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('Response Formatting Integration', () => {
    it('should format custom responses with cultural tone', () => {
      const testContent = 'This is a test response about Andhra culture.';
      const categories: Category[] = ['slang', 'food', 'festival', 'emotion'];
      
      for (const category of categories) {
        const formatted = guide.formatCustomResponse(testContent, category, 'coastal');
        
        expect(formatted).toBeDefined();
        expect(formatted.length).toBeGreaterThan(testContent.length);
        expect(formatted).toMatch(/\b(trust|you know|let me|pakka|believe|honestly)\b/i);
        expect(formatted).toMatch(/[.!?]$/);
      }
    });

    it('should validate response quality correctly', () => {
      const goodResponse = 'Trust me, this pappu is authentic Andhra taste that locals love!';
      const badResponse = 'The API returns database results from the training dataset.';
      
      const goodValidation = guide.validateResponseQuality(goodResponse);
      expect(goodValidation.isValid).toBe(true);
      expect(goodValidation.issues.length).toBe(0);
      
      const badValidation = guide.validateResponseQuality(badResponse);
      expect(badValidation.isValid).toBe(false);
      expect(badValidation.issues.length).toBeGreaterThan(0);
      expect(badValidation.suggestions.length).toBeGreaterThan(0);
    });
  });
});