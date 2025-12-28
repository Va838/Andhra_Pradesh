import { 
  UserInput, 
  UserPreferences, 
  CulturalResponse, 
  Category,
  CulturalError,
  FallbackResponse 
} from './types';
import { 
  DropdownInterfaceImpl,
  InputProcessorImpl,
  ResponseGeneratorImpl,
  RegionalAdapterImpl,
  EmotionFoodMapperImpl,
  ErrorHandler
} from './components';
import { ResponseFormatter } from './components/ResponseFormatter';
import { CulturalDatabaseImpl } from './data';

/**
 * Main application class that orchestrates all components for Andhra cultural guidance
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Dropdown-based cultural queries
 */
export class AndhraCulturalGuide {
  private dropdownInterface: DropdownInterfaceImpl;
  private inputProcessor: InputProcessorImpl;
  private responseGenerator: ResponseGeneratorImpl;
  private responseFormatter: ResponseFormatter;
  private culturalDatabase: CulturalDatabaseImpl;

  constructor() {
    // Initialize all components
    this.culturalDatabase = new CulturalDatabaseImpl();
    this.dropdownInterface = new DropdownInterfaceImpl();
    this.inputProcessor = new InputProcessorImpl();
    this.responseGenerator = new ResponseGeneratorImpl(this.culturalDatabase);
    this.responseFormatter = new ResponseFormatter();
  }

  /**
   * Gets available categories for dropdown selection
   * Requirements: 1.1 - Category selection triggers appropriate subcategories
   */
  getCategories(): string[] {
    try {
      return this.dropdownInterface.getCategories();
    } catch (error) {
      console.error('Error getting categories:', error);
      return ['slang', 'food', 'festival', 'emotion']; // Fallback categories
    }
  }

  /**
   * Gets subcategories for a selected category
   * Requirements: 1.1 - Category selection triggers appropriate subcategories
   */
  getSubcategories(category: string): string[] {
    try {
      return this.dropdownInterface.getSubcategories(category);
    } catch (error) {
      console.error('Error getting subcategories:', error);
      throw new Error(`Unable to get subcategories for "${category}". Please select a valid category.`);
    }
  }

  /**
   * Validates user selection and preferences
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Input validation with user-friendly errors
   */
  validateSelection(category: string, selection: string, preferences?: UserPreferences): { isValid: boolean; error?: string } {
    try {
      const validationResult = this.dropdownInterface.validateSelection(category, selection, preferences);
      
      if (!validationResult.isValid && validationResult.error) {
        return { 
          isValid: false, 
          error: validationResult.error.message 
        };
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('Error validating selection:', error);
      return { 
        isValid: false, 
        error: 'Unable to validate your selection. Please try again.' 
      };
    }
  }

  /**
   * Main method to get cultural guidance based on user selection
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Complete dropdown-based cultural queries
   * Requirements: 2.2, 2.3, 2.5 - Cultural tone, Telugu words, Andhra-specific content
   */
  async getCulturalGuidance(
    category: string, 
    selection: string, 
    preferences?: UserPreferences
  ): Promise<{ response: string; error?: string }> {
    try {
      // Step 1: Process and validate user input
      const userInput = this.dropdownInterface.processSelection(category, selection, preferences);
      
      // Step 2: Enrich and validate input
      const enrichedInput = this.inputProcessor.enrichInput(userInput);
      
      // Step 3: Infer user intent
      const userIntent = this.inputProcessor.inferIntent(enrichedInput);
      
      // Step 4: Generate cultural response
      const culturalResponse = this.responseGenerator.generateResponse(userIntent);
      
      // Step 5: Apply regional context if specified
      const finalResponse = preferences?.region 
        ? this.responseGenerator.applyRegionalContext(culturalResponse, preferences.region)
        : culturalResponse;
      
      // Step 6: Format final output with enhanced formatting
      const formattedResponse = this.responseFormatter.formatResponse(finalResponse);
      
      return { response: formattedResponse };
      
    } catch (error) {
      console.error('Error getting cultural guidance:', error);
      
      // Generate user-friendly error response with cultural formatting
      const errorMessage = this.generateUserFriendlyError(category, selection, error);
      const formattedError = this.responseFormatter.formatErrorResponse(errorMessage, category as Category);
      
      return { 
        response: formattedError,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Gets detailed information about available options for a category
   * Requirements: 1.1 - User-friendly interface for category exploration
   */
  getCategoryInfo(category: string): { 
    subcategories: string[]; 
    description: string; 
    availablePreferences: string[] 
  } {
    try {
      const subcategories = this.getSubcategories(category);
      
      const categoryDescriptions: Record<string, string> = {
        slang: 'Explore authentic Andhra slang expressions with their meanings, emotional context, and social appropriateness.',
        food: 'Discover Andhra street food and traditional dishes based on your city, spice preferences, and dietary needs.',
        festival: 'Learn about Andhra festivals, their cultural significance, associated foods, and regional celebrations.',
        emotion: 'Get food recommendations based on your emotional state, following traditional Andhra cultural wisdom.'
      };
      
      const preferencesByCategory: Record<string, string[]> = {
        slang: ['formality', 'region'],
        food: ['spiceLevel', 'dietary', 'region'],
        festival: ['region'],
        emotion: ['spiceLevel', 'dietary', 'region']
      };
      
      return {
        subcategories,
        description: categoryDescriptions[category] || 'Explore Andhra cultural information.',
        availablePreferences: preferencesByCategory[category] || []
      };
      
    } catch (error) {
      console.error('Error getting category info:', error);
      throw new Error(`Unable to get information for category "${category}"`);
    }
  }

  /**
   * Gets user-friendly error messages for common issues
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages
   */
  getErrorMessage(category: string, selection: string, preferences?: UserPreferences): string {
    // Validate category first
    if (!category || !this.getCategories().includes(category)) {
      return this.dropdownInterface.getCategoryErrorMessage(category);
    }
    
    // Validate selection
    if (!selection || selection.trim() === '') {
      return this.dropdownInterface.getSelectionErrorMessage(category, selection);
    }
    
    // Validate preferences
    if (preferences) {
      const preferenceErrors = this.dropdownInterface.getPreferencesErrorMessage(preferences);
      if (preferenceErrors.length > 0) {
        return preferenceErrors.join(' ');
      }
    }
    
    return 'Your selection looks good! Try getting cultural guidance.';
  }

  /**
   * Provides suggestions for similar or related cultural topics
   * Requirements: 8.2 - Fallback logic for non-existent cultural information
   */
  getSuggestions(category: string, failedSelection?: string): string[] {
    try {
      const subcategories = this.getSubcategories(category);
      
      // If a specific selection failed, suggest similar options
      if (failedSelection) {
        const lowerFailed = failedSelection.toLowerCase();
        const similar = subcategories.filter(sub => 
          sub.toLowerCase().includes(lowerFailed) || 
          lowerFailed.includes(sub.toLowerCase())
        );
        
        if (similar.length > 0) {
          return similar.slice(0, 3); // Return top 3 similar suggestions
        }
      }
      
      // Return popular options for the category
      const popularOptions: Record<string, string[]> = {
        slang: ['greeting expressions', 'emotional expressions', 'casual conversation'],
        food: ['street food', 'breakfast items', 'snacks'],
        festival: ['Ugadi', 'Sankranti', 'Dussehra'],
        emotion: ['happy', 'sad', 'tired']
      };
      
      return popularOptions[category] || subcategories.slice(0, 3);
      
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Checks if the cultural database is properly loaded
   * Requirements: 8.1, 8.3 - System validation and data integrity
   */
  isReady(): boolean {
    try {
      // Basic health check - try to get categories and validate database
      const categories = this.getCategories();
      return categories.length > 0 && this.culturalDatabase !== null;
    } catch (error) {
      console.error('System readiness check failed:', error);
      return false;
    }
  }

  /**
   * Validates response quality and format
   * Requirements: 2.2, 2.3, 2.5 - Response quality validation
   */
  validateResponseQuality(response: string): { isValid: boolean; issues: string[]; suggestions: string[] } {
    const validation = this.responseFormatter.validateResponseFormat(response);
    const suggestions: string[] = [];

    if (!validation.isValid) {
      validation.issues.forEach(issue => {
        switch (issue) {
          case 'Response should include Telugu vocabulary':
            suggestions.push('Add Telugu words like babu, amma, arey, or pappu for authenticity');
            break;
          case 'Response contains technical implementation details':
            suggestions.push('Remove technical terms and focus on cultural content');
            break;
          case 'Response should have warm, friendly tone':
            suggestions.push('Add warm expressions like "Trust me" or "You know what"');
            break;
          case 'Response should end with proper punctuation':
            suggestions.push('End sentences with proper punctuation (. ! ?)');
            break;
        }
      });
    }

    return {
      isValid: validation.isValid,
      issues: validation.issues,
      suggestions
    };
  }

  /**
   * Formats a custom response with cultural tone
   * Requirements: 2.2, 2.3, 2.5 - Custom response formatting
   */
  formatCustomResponse(content: string, category: Category, region?: string): string {
    const mockResponse: CulturalResponse = {
      content,
      teluguWords: ['babu'], // Default Telugu word
      culturalTone: 'warm and friendly',
      region: region as any,
      category
    };

    return this.responseFormatter.formatResponse(mockResponse);
  }

  /**
   * Gets system status and health information
   * Requirements: 8.2 - System monitoring and error handling
   */
  getSystemStatus(): { 
    isReady: boolean; 
    components: Record<string, boolean>; 
    lastError?: string 
  } {
    const status = {
      isReady: false,
      components: {
        dropdownInterface: false,
        inputProcessor: false,
        responseGenerator: false,
        culturalDatabase: false
      },
      lastError: undefined as string | undefined
    };

    try {
      // Test each component
      status.components.dropdownInterface = this.dropdownInterface.getCategories().length > 0;
      status.components.inputProcessor = this.inputProcessor !== null;
      status.components.responseGenerator = this.responseGenerator !== null;
      status.components.culturalDatabase = this.culturalDatabase !== null;
      
      status.isReady = Object.values(status.components).every(Boolean);
      
    } catch (error) {
      status.lastError = error instanceof Error ? error.message : 'Unknown system error';
      console.error('System status check failed:', error);
    }

    return status;
  }

  /**
   * Generates user-friendly error messages
   * Requirements: 8.2 - Graceful error handling
   */
  private generateUserFriendlyError(category: string, selection: string, error: any): string {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for common error patterns and provide helpful responses
    if (errorMessage.includes('Invalid category')) {
      return `I don't recognize "${category}" as a cultural category. Try asking about slang, food, festivals, or emotions!`;
    }
    
    if (errorMessage.includes('not available')) {
      const suggestions = this.getSuggestions(category, selection);
      let response = `I don't have information about "${selection}" in ${category}. `;
      if (suggestions.length > 0) {
        response += `How about trying: ${suggestions.join(', ')}?`;
      } else {
        response += `Try exploring other options in ${category}!`;
      }
      return response;
    }
    
    if (errorMessage.includes('validation')) {
      return `There seems to be an issue with your selection. Please check your category and preferences, then try again.`;
    }
    
    // Generic friendly error
    return `Arey, I'm having trouble understanding your request! Please try selecting a category (slang, food, festival, or emotion) and make a choice from the available options.`;
  }
}