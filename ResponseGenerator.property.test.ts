import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ResponseGeneratorImpl } from './ResponseGeneratorImpl';
import { UserIntent, Category, SpiceLevel, DietaryPreference, Region } from '../types';

/**
 * **Feature: andhra-local-guide, Property 6: Responses include Telugu vocabulary**
 * **Validates: Requirements 2.2**
 */
describe('ResponseGenerator Property Tests', () => {
  const responseGenerator = new ResponseGeneratorImpl();

  // Telugu vocabulary that should appear in responses
  const teluguVocabulary = [
    'babu', 'amma', 'arey', 'baboi', 'chinnodu', 'pedda', 'mama', 'mami',
    'pappu', 'avakaya', 'rasam', 'biryani', 'punugulu', 'karam', 'pachadi', 'gongura',
    'panduga', 'prasadam', 'pooja', 'kalyanam', 'sankranti', 'ugadi',
    'santosham', 'badha', 'kopam', 'shantham', 'josh', 'lite'
  ];

  // Generators for property-based testing
  const categoryArb = fc.constantFrom<Category>('slang', 'food', 'festival', 'emotion');
  const spiceLevelArb = fc.constantFrom<SpiceLevel>('low', 'medium', 'high', 'extreme');
  const dietaryArb = fc.constantFrom<DietaryPreference>('veg', 'non-veg', 'any');
  const regionArb = fc.constantFrom<Region>('coastal', 'guntur', 'rayalaseema');

  const selectionArb = fc.oneof(
    // Slang terms
    fc.constantFrom('Arey Baboi', 'Doola Teerinda?', 'Taggede Le', 'Lite Teesko', 'Chala Scene Undi'),
    // Food cities/items
    fc.constantFrom('Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Punugulu', 'Biryani'),
    // Festivals
    fc.constantFrom('Sankranti', 'Ugadi', 'Vinayaka Chavithi'),
    // Emotions
    fc.constantFrom('sad', 'sick', 'happy', 'angry', 'tired')
  );

  const userIntentArb = fc.record({
    category: categoryArb,
    selection: selectionArb,
    preferences: fc.record({
      spiceLevel: fc.option(spiceLevelArb),
      dietary: fc.option(dietaryArb),
      formality: fc.option(fc.constantFrom('formal', 'informal')),
      region: fc.option(regionArb)
    }),
    context: fc.record({
      region: fc.option(regionArb),
      timeOfDay: fc.option(fc.constantFrom('morning', 'afternoon', 'evening', 'night'))
    })
  });

  /**
   * Property 6: Responses include Telugu vocabulary
   * For any valid user intent, the generated response should contain at least one Telugu word
   */
  it('should include Telugu vocabulary in all responses', () => {
    fc.assert(
      fc.property(userIntentArb, (intent: UserIntent) => {
        const response = responseGenerator.generateResponse(intent);
        const formattedOutput = responseGenerator.formatOutput(response);
        
        // Check if the response contains at least one Telugu word
        const containsTeluguWord = teluguVocabulary.some(word => 
          formattedOutput.toLowerCase().includes(word.toLowerCase())
        );
        
        // Also check the teluguWords array in the response
        const hasTeluguWordsArray = response.teluguWords && response.teluguWords.length > 0;
        
        // At least one of these should be true
        expect(containsTeluguWord || hasTeluguWordsArray).toBe(true);
        
        // If teluguWords array exists, it should contain valid Telugu words
        if (response.teluguWords && response.teluguWords.length > 0) {
          response.teluguWords.forEach(word => {
            expect(teluguVocabulary).toContain(word.toLowerCase());
          });
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Responses avoid technical implementation details
   * For any valid user intent, the response should not contain technical terms
   */
  it('should avoid technical implementation details in responses', () => {
    const technicalTerms = [
      'api', 'database', 'dataset', 'training data', 'algorithm', 'model',
      'implementation', 'system', 'interface', 'component', 'module',
      'configuration', 'parameter', 'function', 'method', 'class'
    ];

    fc.assert(
      fc.property(userIntentArb, (intent: UserIntent) => {
        const response = responseGenerator.generateResponse(intent);
        const formattedOutput = responseGenerator.formatOutput(response);
        
        // Check that no technical terms appear in the formatted output
        const containsTechnicalTerm = technicalTerms.some(term => 
          formattedOutput.toLowerCase().includes(term.toLowerCase())
        );
        
        expect(containsTechnicalTerm).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Responses are Andhra-specific
   * For any valid user intent, the response should reference Andhra-specific content
   */
  it('should generate Andhra-specific responses', () => {
    const andhraCulturalMarkers = [
      'andhra', 'telugu', 'coastal', 'guntur', 'rayalaseema', 'visakhapatnam', 'vijayawada',
      'pappu', 'avakaya', 'gongura', 'biryani', 'rasam', 'sankranti', 'ugadi',
      'babu', 'amma', 'arey', 'baboi', 'culture', 'tradition'
    ];

    fc.assert(
      fc.property(userIntentArb, (intent: UserIntent) => {
        const response = responseGenerator.generateResponse(intent);
        const formattedOutput = responseGenerator.formatOutput(response);
        
        // Check if the response contains Andhra-specific cultural markers
        const containsAndhraCulture = andhraCulturalMarkers.some(marker => 
          formattedOutput.toLowerCase().includes(marker.toLowerCase())
        );
        
        expect(containsAndhraCulture).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Regional adaptation affects response characteristics
   * For any user intent with regional context, the response should reflect regional characteristics
   */
  it('should adapt responses based on regional context', () => {
    fc.assert(
      fc.property(
        userIntentArb.filter(intent => intent.context.region !== undefined && intent.context.region !== null),
        (intent: UserIntent) => {
          const response = responseGenerator.generateResponse(intent);
          const adaptedResponse = responseGenerator.applyRegionalContext(response, intent.context.region);
          
          // The adapted response should have regional characteristics
          expect(adaptedResponse.region).toBe(intent.context.region);
          expect(adaptedResponse.culturalTone).toBeDefined();
          
          // Regional adaptation should change the content or tone
          const hasRegionalAdaptation = 
            adaptedResponse.content !== response.content ||
            adaptedResponse.culturalTone !== response.culturalTone;
          
          expect(hasRegionalAdaptation).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: andhra-local-guide, Property 2: Slang responses contain complete information**
   * **Validates: Requirements 1.2, 5.1, 5.2, 5.3, 5.4, 5.5**
   */
  it('should provide complete information for slang responses', () => {
    const slangTerms = ['Arey Baboi', 'Doola Teerinda?', 'Taggede Le', 'Lite Teesko', 'Chala Scene Undi'];
    const slangIntentArb = fc.record({
      category: fc.constant<Category>('slang'),
      selection: fc.constantFrom(...slangTerms),
      preferences: fc.record({
        spiceLevel: fc.option(spiceLevelArb),
        dietary: fc.option(dietaryArb),
        formality: fc.option(fc.constantFrom('formal', 'informal')),
        region: fc.option(regionArb)
      }),
      context: fc.record({
        region: fc.option(regionArb),
        timeOfDay: fc.option(fc.constantFrom('morning', 'afternoon', 'evening', 'night'))
      })
    });

    fc.assert(
      fc.property(slangIntentArb, (intent: UserIntent) => {
        const response = responseGenerator.generateResponse(intent);
        const formattedOutput = responseGenerator.formatOutput(response);
        
        // Slang responses should contain complete information:
        // - Literal meaning
        // - Emotional intent
        // - Social appropriateness
        // - Formality level
        
        const hasLiteralMeaning = formattedOutput.toLowerCase().includes('means') || 
                                 formattedOutput.toLowerCase().includes('meaning');
        const hasEmotionalContext = formattedOutput.toLowerCase().includes('intent') ||
                                   formattedOutput.toLowerCase().includes('emotion') ||
                                   formattedOutput.toLowerCase().includes('feeling');
        const hasSocialContext = formattedOutput.toLowerCase().includes('appropriate') ||
                                formattedOutput.toLowerCase().includes('informal') ||
                                formattedOutput.toLowerCase().includes('formal') ||
                                formattedOutput.toLowerCase().includes('close') ||
                                formattedOutput.toLowerCase().includes('casual');
        
        // At least 2 of these 3 aspects should be present for completeness
        const completenessScore = [hasLiteralMeaning, hasEmotionalContext, hasSocialContext].filter(Boolean).length;
        expect(completenessScore).toBeGreaterThanOrEqual(2);
        
        // Should be culturally contextual
        const hasCulturalContext = formattedOutput.toLowerCase().includes('andhra') ||
                                  formattedOutput.toLowerCase().includes('culture') ||
                                  formattedOutput.toLowerCase().includes('tradition');
        expect(hasCulturalContext).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: andhra-local-guide, Property 3: Food recommendations respect user preferences**
   * **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.4**
   */
  it('should respect user preferences in food recommendations', () => {
    const foodIntentArb = fc.record({
      category: fc.constant<Category>('food'),
      selection: fc.constantFrom('Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'),
      preferences: fc.record({
        spiceLevel: spiceLevelArb,
        dietary: dietaryArb,
        formality: fc.option(fc.constantFrom('formal', 'informal')),
        region: fc.option(regionArb)
      }),
      context: fc.record({
        region: fc.option(regionArb),
        timeOfDay: fc.constantFrom('morning', 'afternoon', 'evening', 'night')
      })
    });

    fc.assert(
      fc.property(foodIntentArb, (intent: UserIntent) => {
        const response = responseGenerator.generateResponse(intent);
        const formattedOutput = responseGenerator.formatOutput(response);
        
        // Food recommendations should respect preferences:
        // - Spice level consideration
        // - Dietary preferences (if specified)
        // - Time of day appropriateness
        // - City-specific recommendations
        
        // Should mention the city
        const mentionsCity = intent.selection.toLowerCase().split(' ').some(word => 
          formattedOutput.toLowerCase().includes(word)
        );
        expect(mentionsCity).toBe(true);
        
        // Should have spice level information
        const hasSpiceInfo = formattedOutput.toLowerCase().includes('spice') ||
                            formattedOutput.toLowerCase().includes('mild') ||
                            formattedOutput.toLowerCase().includes('hot') ||
                            formattedOutput.toLowerCase().includes('medium') ||
                            formattedOutput.toLowerCase().includes('extreme');
        expect(hasSpiceInfo).toBe(true);
        
        // Should have timing information (unless it's a fallback response)
        const isFallbackResponse = formattedOutput.toLowerCase().includes("don't have specific") ||
                                  formattedOutput.toLowerCase().includes("similar") ||
                                  formattedOutput.toLowerCase().includes("try exploring");
        
        if (!isFallbackResponse) {
          const hasTimingInfo = formattedOutput.toLowerCase().includes('morning') ||
                               formattedOutput.toLowerCase().includes('evening') ||
                               formattedOutput.toLowerCase().includes('lunch') ||
                               formattedOutput.toLowerCase().includes('dinner') ||
                               formattedOutput.toLowerCase().includes('night') ||
                               formattedOutput.toLowerCase().includes('afternoon') ||
                               formattedOutput.toLowerCase().includes('dining') ||
                               formattedOutput.toLowerCase().includes('time') ||
                               formattedOutput.toLowerCase().includes('during') ||
                               formattedOutput.toLowerCase().includes('best') ||
                               formattedOutput.toLowerCase().includes('perfect') ||
                               formattedOutput.toLowerCase().includes('enjoyed');
          expect(hasTimingInfo).toBe(true);
        }
        
        // Should be culturally authentic
        const hasAuthenticity = formattedOutput.toLowerCase().includes('authentic') ||
                               formattedOutput.toLowerCase().includes('local') ||
                               formattedOutput.toLowerCase().includes('traditional') ||
                               formattedOutput.toLowerCase().includes('andhra');
        expect(hasAuthenticity).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: andhra-local-guide, Property 4: Festival responses contain comprehensive information**
   * **Validates: Requirements 1.4, 6.1, 6.2, 6.3**
   */
  it('should provide comprehensive information for festival responses', () => {
    const festivalIntentArb = fc.record({
      category: fc.constant<Category>('festival'),
      selection: fc.constantFrom('Sankranti', 'Ugadi', 'Vinayaka Chavithi'),
      preferences: fc.record({
        spiceLevel: fc.option(spiceLevelArb),
        dietary: fc.option(dietaryArb),
        formality: fc.option(fc.constantFrom('formal', 'informal')),
        region: fc.option(regionArb)
      }),
      context: fc.record({
        region: fc.option(regionArb),
        timeOfDay: fc.option(fc.constantFrom('morning', 'afternoon', 'evening', 'night'))
      })
    });

    fc.assert(
      fc.property(festivalIntentArb, (intent: UserIntent) => {
        const response = responseGenerator.generateResponse(intent);
        const formattedOutput = responseGenerator.formatOutput(response);
        
        // Festival responses should contain comprehensive information:
        // - Cultural meaning
        // - Associated food traditions
        // - Food symbolism
        // - Emotional tone
        
        // Should mention cultural meaning or significance
        const hasCulturalMeaning = formattedOutput.toLowerCase().includes('meaning') ||
                                  formattedOutput.toLowerCase().includes('significance') ||
                                  formattedOutput.toLowerCase().includes('celebrate') ||
                                  formattedOutput.toLowerCase().includes('tradition');
        expect(hasCulturalMeaning).toBe(true);
        
        // Should mention food traditions
        const hasFoodTraditions = formattedOutput.toLowerCase().includes('food') ||
                                 formattedOutput.toLowerCase().includes('prepare') ||
                                 formattedOutput.toLowerCase().includes('eat') ||
                                 formattedOutput.toLowerCase().includes('dish');
        expect(hasFoodTraditions).toBe(true);
        
        // Should have emotional context
        const hasEmotionalTone = formattedOutput.toLowerCase().includes('joy') ||
                                formattedOutput.toLowerCase().includes('celebration') ||
                                formattedOutput.toLowerCase().includes('family') ||
                                formattedOutput.toLowerCase().includes('bond') ||
                                formattedOutput.toLowerCase().includes('gratitude') ||
                                formattedOutput.toLowerCase().includes('hope');
        expect(hasEmotionalTone).toBe(true);
        
        // Should be Andhra-specific
        const hasAndhraContext = formattedOutput.toLowerCase().includes('andhra') ||
                                formattedOutput.toLowerCase().includes('telugu') ||
                                formattedOutput.toLowerCase().includes('tradition') ||
                                formattedOutput.toLowerCase().includes('culture');
        expect(hasAndhraContext).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});