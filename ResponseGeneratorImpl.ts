import { ResponseGenerator } from '../interfaces/ResponseGenerator';
import { UserIntent, CulturalResponse, Category, Region, FallbackResponse } from '../types';
import { CulturalDatabaseImpl } from '../data/CulturalDatabaseImpl';
import { RegionalAdapterImpl } from './RegionalAdapterImpl';
import { EmotionFoodMapperImpl } from './EmotionFoodMapperImpl';
import { ErrorHandler } from './ErrorHandler';
import { ResponseFormatter } from './ResponseFormatter';

export class ResponseGeneratorImpl implements ResponseGenerator {
  private culturalDatabase: CulturalDatabaseImpl;
  private regionalAdapter: RegionalAdapterImpl;
  private emotionFoodMapper: EmotionFoodMapperImpl;
  private responseFormatter: ResponseFormatter;
  
  // Telugu vocabulary for natural integration
  private teluguVocabulary: Record<Category, string[]> = {
    slang: ['babu', 'amma', 'arey', 'baboi', 'chinnodu', 'pedda', 'mama', 'mami'],
    food: ['pappu', 'avakaya', 'rasam', 'biryani', 'punugulu', 'karam', 'pachadi', 'gongura'],
    festival: ['panduga', 'prasadam', 'pooja', 'kalyanam', 'sankranti', 'ugadi'],
    emotion: ['santosham', 'badha', 'kopam', 'shantham', 'josh', 'lite']
  };

  constructor(culturalDatabase?: CulturalDatabaseImpl) {
    this.culturalDatabase = culturalDatabase || new CulturalDatabaseImpl();
    this.regionalAdapter = new RegionalAdapterImpl();
    this.emotionFoodMapper = new EmotionFoodMapperImpl();
    this.responseFormatter = new ResponseFormatter();
  }

  /**
   * Generates culturally appropriate response based on user intent
   * Requirements: 2.2, 2.3, 2.5 - Cultural tone, Telugu words, Andhra-specific content
   * Requirements: 8.2 - Graceful degradation for component failures
   */
  generateResponse(intent: UserIntent): CulturalResponse {
    try {
      let content: string;
      let teluguWords: string[] = [];
      
      // Generate category-specific response with error handling
      switch (intent.category) {
        case 'slang':
          content = this.generateSlangResponseWithFallback(intent);
          teluguWords = this.selectTeluguWords('slang', 2);
          break;
        case 'food':
          content = this.generateFoodResponseWithFallback(intent);
          teluguWords = this.selectTeluguWords('food', 2);
          break;
        case 'festival':
          content = this.generateFestivalResponseWithFallback(intent);
          teluguWords = this.selectTeluguWords('festival', 2);
          break;
        case 'emotion':
          content = this.generateEmotionResponseWithFallback(intent);
          teluguWords = this.selectTeluguWords('emotion', 2);
          break;
        default:
          content = this.generateFallbackResponse(intent);
          teluguWords = this.selectTeluguWords('slang', 1);
      }

      // Ensure Telugu words are integrated naturally
      content = this.integrateTeluguWords(content, teluguWords);

      return {
        content,
        teluguWords,
        culturalTone: 'warm and friendly',
        region: intent.context.region,
        category: intent.category
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateErrorResponse(intent, error);
    }
  }

  /**
   * Applies regional context to response
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5 - Regional adaptation
   */
  applyRegionalContext(response: CulturalResponse, region?: string): CulturalResponse {
    if (!region && !response.region) {
      return response;
    }

    const targetRegion = (region as Region) || response.region!;
    
    // Apply regional tone adaptation
    const adaptedContent = this.regionalAdapter.adaptTone(response.content, targetRegion);
    
    // Get regional cultural context
    const regionalContext = this.regionalAdapter.getRegionalCulturalContext(targetRegion);
    
    return {
      ...response,
      content: adaptedContent,
      culturalTone: regionalContext.tone,
      region: targetRegion
    };
  }

  /**
   * Formats the final output with cultural warmth
   * Requirements: 2.1, 2.2, 2.3 - Warm tone, Telugu integration, no technical terms
   */
  formatOutput(response: CulturalResponse): string {
    return this.responseFormatter.formatResponse(response);
  }

  /**
   * Generates response for slang queries with fallback handling
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  private generateSlangResponseWithFallback(intent: UserIntent): string {
    try {
      const slangResult = this.culturalDatabase.getSlangInfoWithFallback(intent.selection);
      
      // Check if it's a fallback response
      if ('isApproximation' in slangResult) {
        return slangResult.content;
      }
      
      // Generate normal response
      const slangInfo = slangResult;
      let response = `"${slangInfo.term}" literally means "${slangInfo.literalMeaning}". `;
      response += `The emotional intent is ${slangInfo.emotionalIntent.toLowerCase()}. `;
      response += `It's ${slangInfo.socialAppropriateness.toLowerCase()}, `;
      response += `and it's definitely ${slangInfo.formalityLevel} language. `;

      // Add regional variations if available
      if (slangInfo.regionalVariations && slangInfo.regionalVariations.length > 0) {
        response += `Different regions have their own touch - `;
        slangInfo.regionalVariations.forEach((variation, index) => {
          response += `in ${variation.region}, they say "${variation.variation}"`;
          if (index < slangInfo.regionalVariations!.length - 1) {
            response += ', ';
          }
        });
        response += '. ';
      }

      response += `That's how we express ourselves in Andhra culture!`;
      return response;
    } catch (error) {
      console.error('Error generating slang response:', error);
      return ErrorHandler.createSlangFallback(intent.selection).content;
    }
  }

  /**
   * Generates response for food queries with fallback handling
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  private generateFoodResponseWithFallback(intent: UserIntent): string {
    try {
      // Extract city from selection or use preferences
      const city = this.extractCityFromSelection(intent.selection) || 'visakhapatnam';
      
      const foodPreferences = {
        spiceLevel: intent.preferences.spiceLevel || 'medium',
        dietary: intent.preferences.dietary || 'any',
        timeOfDay: intent.context.timeOfDay,
        region: intent.preferences.region
      };

      const foodResult = this.culturalDatabase.getFoodInfoWithFallback(city, foodPreferences);
      
      // Check if it's a fallback response
      if ('isApproximation' in foodResult) {
        return foodResult.content;
      }
      
      // Generate normal response
      const foodOptions = foodResult;
      if (foodOptions.length === 0) {
        return ErrorHandler.createFoodFallback(city, intent.preferences).content;
      }

      const selectedFood = foodOptions[0];
      
      let response = `For ${city}, I'd recommend ${selectedFood.name}! `;
      response += `${selectedFood.description}. `;
      
      // Handle timing information more descriptively
      const bestTime = selectedFood.bestTime.toLowerCase();
      if (bestTime === 'any') {
        response += `It's perfect for any time of day, `;
      } else {
        response += `It's best enjoyed during ${bestTime.toLowerCase()}, `;
      }
      
      response += `and the spice level is ${selectedFood.spiceLevel}. `;
      
      if (selectedFood.culturalSignificance) {
        response += `${selectedFood.culturalSignificance}. `;
      }
      
      response += `This is authentic Andhra taste that locals love!`;
      return response;
    } catch (error) {
      console.error('Error generating food response:', error);
      const city = this.extractCityFromSelection(intent.selection) || 'visakhapatnam';
      return ErrorHandler.createFoodFallback(city, intent.preferences).content;
    }
  }

  /**
   * Generates response for festival queries with fallback handling
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  private generateFestivalResponseWithFallback(intent: UserIntent): string {
    try {
      const festivalResult = this.culturalDatabase.getFestivalInfoWithFallback(intent.selection);
      
      // Check if it's a fallback response
      if ('isApproximation' in festivalResult) {
        return festivalResult.content;
      }
      
      // Generate normal response
      const festivalInfo = festivalResult;
      let response = `${festivalInfo.name} is all about ${festivalInfo.culturalMeaning.toLowerCase()}. `;
      response += `The emotional tone is ${festivalInfo.emotionalTone.toLowerCase()}. `;
      
      // Add food traditions
      if (festivalInfo.associatedFoods.length > 0) {
        response += `We prepare special foods like ${festivalInfo.associatedFoods.join(', ')}. `;
        response += `${festivalInfo.foodSymbolism}. `;
      }
      
      // Add regional variations if available
      if (festivalInfo.regionalVariations && festivalInfo.regionalVariations.length > 0) {
        response += `Different regions celebrate it uniquely - `;
        festivalInfo.regionalVariations.forEach((variation, index) => {
          response += `${variation.region} region ${variation.variation.toLowerCase()}`;
          if (index < festivalInfo.regionalVariations!.length - 1) {
            response += ', ';
          }
        });
        response += '. ';
      }
      
      response += `That's the beauty of Andhra festival traditions!`;
      return response;
    } catch (error) {
      console.error('Error generating festival response:', error);
      return ErrorHandler.createFestivalFallback(intent.selection).content;
    }
  }

  /**
   * Generates response for emotion-based food queries with fallback handling
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  private generateEmotionResponseWithFallback(intent: UserIntent): string {
    try {
      const recommendation = this.emotionFoodMapper.mapEmotionToFood(intent.selection);
      const adaptedRecommendation = this.emotionFoodMapper.considerPreferences(recommendation, intent.preferences);
      
      let response = `When you're feeling ${intent.selection}, ${adaptedRecommendation.food} is perfect! `;
      response += `${adaptedRecommendation.reasoning}. `;
      response += `${adaptedRecommendation.culturalContext}. `;
      
      // Add emotional logic explanation
      const emotionalLogic = this.emotionFoodMapper.explainEmotionalLogic(intent.selection, adaptedRecommendation.food);
      response += `${emotionalLogic}`;
      
      return response;
    } catch (error) {
      console.error('Error generating emotion response:', error);
      return ErrorHandler.createEmotionFallback(intent.selection).content;
    }
  }

  /**
   * Generates error response when component fails
   * Requirements: 8.2 - Graceful degradation for component failures
   */
  private generateErrorResponse(intent: UserIntent, error: any): CulturalResponse {
    const errorContent = `I'm having trouble processing your request about ${intent.category}. ` +
                        `Let me try to help you with general Andhra cultural information instead!`;
    
    return {
      content: errorContent,
      teluguWords: ['arey'],
      culturalTone: 'apologetic but helpful',
      region: intent.context.region,
      category: intent.category
    };
  }

  /**
   * Selects appropriate Telugu words for the category
   */
  private selectTeluguWords(category: Category, count: number): string[] {
    const words = this.teluguVocabulary[category] || this.teluguVocabulary.slang;
    const selected: string[] = [];
    
    // Randomly select words without repetition
    const availableWords = [...words];
    for (let i = 0; i < Math.min(count, availableWords.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      selected.push(availableWords.splice(randomIndex, 1)[0]);
    }
    
    return selected;
  }

  /**
   * Integrates Telugu words naturally into the content
   */
  private integrateTeluguWords(content: string, teluguWords: string[]): string {
    // Simple integration - replace some common English words with Telugu equivalents
    let integratedContent = content;
    
    // Integration patterns
    const integrationPatterns: Record<string, string> = {
      'babu': 'babu',
      'amma': 'amma',
      'arey': 'arey',
      'baboi': 'baboi'
    };
    
    // Ensure at least one Telugu word is present
    if (teluguWords.length > 0 && !teluguWords.some(word => integratedContent.toLowerCase().includes(word))) {
      // Add a Telugu word naturally at the beginning
      const firstWord = teluguWords[0];
      if (['arey', 'baboi'].includes(firstWord)) {
        integratedContent = `${firstWord.charAt(0).toUpperCase() + firstWord.slice(1)}, ${integratedContent.toLowerCase()}`;
      } else {
        integratedContent = `${integratedContent} That's how we say it, ${firstWord}!`;
      }
    }
    
    return integratedContent;
  }

  /**
   * Fallback responses for missing data
   */
  private generateSlangFallback(term: string): string {
    return `I don't have specific information about "${term}" in my cultural knowledge, but it sounds like authentic Andhra slang! These expressions usually carry deep emotional meaning in our culture.`;
  }

  private generateFoodFallback(city: string, preferences: any): string {
    const spiceLevel = preferences.spiceLevel || 'medium';
    const timeOfDay = preferences.timeOfDay || 'any time';
    const dietary = preferences.dietary || 'any';
    
    let response = `I don't have specific food recommendations for ${city} with your ${dietary} preferences, `;
    response += `but Andhra cuisine always has something delicious! `;
    response += `For ${spiceLevel} spice level and ${timeOfDay} dining, `;
    response += `you can explore authentic local spots. `;
    response += `Try asking about popular cities like Visakhapatnam, Vijayawada, or Guntur for more specific recommendations.`;
    
    return response;
  }

  private generateFestivalFallback(festival: string): string {
    return `I don't have detailed information about "${festival}", but Andhra festivals are always rich in cultural meaning and food traditions! Each celebration brings families together with special preparations.`;
  }

  private generateFallbackResponse(intent: UserIntent): string {
    return `I'd love to help you learn about Andhra culture! Try asking about our slang, street food, festivals, or emotion-based food recommendations.`;
  }

  /**
   * Extracts city name from user selection
   */
  private extractCityFromSelection(selection: string): string | null {
    const cities = ['visakhapatnam', 'vijayawada', 'guntur', 'tirupati', 'vizag'];
    const lowerSelection = selection.toLowerCase();
    
    return cities.find(city => lowerSelection.includes(city)) || null;
  }
}