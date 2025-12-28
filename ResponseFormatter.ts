import { CulturalResponse, Category, Region } from '../types';

/**
 * Handles final response formatting with cultural tone and consistent structure
 * Requirements: 2.2, 2.3, 2.5 - Cultural tone, Telugu integration, Andhra-specific content
 */
export class ResponseFormatter {
  private readonly culturalGreetings: Record<Region, string[]> = {
    coastal: ['Trust me', 'You know what', 'Let me tell you', 'Honestly speaking'],
    guntur: ['Pakka guarantee', 'Believe me', 'No doubt about it', 'Fire ga cheppali ante'],
    rayalaseema: ['Simple ga cheppali ante', 'Traditional ga', 'Straight forward ga', 'Honestly']
  };

  private readonly culturalClosings: Record<Category, string[]> = {
    slang: [
      'That\'s how we express ourselves in Andhra culture!',
      'This is authentic Andhra way of speaking!',
      'That\'s the beauty of our Telugu expressions!'
    ],
    food: [
      'This is authentic Andhra taste that locals love!',
      'That\'s real Andhra flavor for you!',
      'This is what makes Andhra cuisine special!'
    ],
    festival: [
      'That\'s the beauty of Andhra festival traditions!',
      'This is how we celebrate in Andhra culture!',
      'That\'s the richness of our cultural heritage!'
    ],
    emotion: [
      'That\'s the wisdom of Andhra food culture!',
      'This is how we heal through food in our tradition!',
      'That\'s the emotional connection we have with food!'
    ]
  };

  /**
   * Formats response with consistent cultural structure
   * Requirements: 2.2, 2.3, 2.5 - Consistent output structure across all categories
   */
  formatResponse(response: CulturalResponse): string {
    let formattedContent = response.content;

    // Step 1: Ensure cultural warmth at the beginning
    formattedContent = this.addCulturalOpening(formattedContent, response.region);

    // Step 2: Ensure Telugu words are naturally integrated
    formattedContent = this.ensureTeluguIntegration(formattedContent, response.teluguWords);

    // Step 3: Remove any technical implementation details
    formattedContent = this.removeTechnicalTerms(formattedContent);

    // Step 4: Add appropriate cultural closing
    formattedContent = this.addCulturalClosing(formattedContent, response.category);

    // Step 5: Ensure proper sentence structure and flow
    formattedContent = this.improveFlow(formattedContent);

    return formattedContent;
  }

  /**
   * Formats error responses with cultural warmth
   * Requirements: 8.2 - User-friendly error messages with cultural tone
   */
  formatErrorResponse(errorMessage: string, category?: Category): string {
    const culturalErrorOpeners = [
      'Arey',
      'Baboi',
      'Sorry ra'
    ];

    const opener = culturalErrorOpeners[Math.floor(Math.random() * culturalErrorOpeners.length)];
    let formattedError = `${opener}, ${errorMessage.toLowerCase()}`;

    // Add helpful suggestion based on category
    if (category) {
      const suggestions = this.getCategorySuggestions(category);
      formattedError += ` ${suggestions}`;
    } else {
      formattedError += ' Try asking about slang, food, festivals, or emotions - I\'m here to help with Andhra culture!';
    }

    return formattedError;
  }

  /**
   * Formats success responses with celebration
   * Requirements: 2.1 - Warm, friendly, local conversational tone
   */
  formatSuccessResponse(content: string, category: Category): string {
    const successOpeners = [
      'Perfect!',
      'Excellent choice!',
      'Great question!'
    ];

    const opener = successOpeners[Math.floor(Math.random() * successOpeners.length)];
    return `${opener} ${content}`;
  }

  /**
   * Adds cultural opening if not present
   */
  private addCulturalOpening(content: string, region?: Region): string {
    // Check if content already has a cultural opening
    const hasOpening = /^(trust me|you know|let me tell|pakka|believe|honestly|simple|arey|baboi)/i.test(content);
    
    if (!hasOpening) {
      const greetings = region ? this.culturalGreetings[region] : this.culturalGreetings.coastal;
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      content = `${randomGreeting}, ${content.toLowerCase()}`;
    }

    return content;
  }

  /**
   * Ensures Telugu words are naturally integrated
   */
  private ensureTeluguIntegration(content: string, teluguWords: string[]): string {
    if (teluguWords.length === 0) {
      return content;
    }

    // Check if Telugu words are already present
    const hasTeluguWords = teluguWords.some(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );

    if (!hasTeluguWords) {
      // Add the first Telugu word naturally
      const word = teluguWords[0];
      
      // Different integration strategies based on word type
      if (['arey', 'baboi'].includes(word.toLowerCase())) {
        content = `${word.charAt(0).toUpperCase() + word.slice(1)}, ${content.toLowerCase()}`;
      } else if (['babu', 'amma'].includes(word.toLowerCase())) {
        content = `${content} That's what we call it, ${word}!`;
      } else {
        content = `${content} We call it ${word} in Telugu.`;
      }
    }

    return content;
  }

  /**
   * Removes technical implementation terms
   */
  private removeTechnicalTerms(content: string): string {
    const technicalTerms = [
      /\b(API|database|dataset|training data|algorithm|model)\b/gi,
      /\b(implementation|system|interface|component|module)\b/gi,
      /\b(configuration|parameter|function|method|class)\b/gi,
      /\b(server|client|endpoint|request|response)\b/gi,
      /\b(JSON|XML|HTTP|REST|GraphQL)\b/gi
    ];

    let cleanedContent = content;
    technicalTerms.forEach(regex => {
      cleanedContent = cleanedContent.replace(regex, '');
    });

    // Clean up extra spaces and punctuation
    cleanedContent = cleanedContent
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.!?])/g, '$1')
      .trim();

    return cleanedContent;
  }

  /**
   * Adds appropriate cultural closing
   */
  private addCulturalClosing(content: string, category: Category): string {
    // Check if content already has a cultural closing
    const hasClosing = /\b(that's|this is|beauty|authentic|traditional|culture|heritage)\b.*[!.]$/i.test(content);
    
    if (!hasClosing) {
      const closings = this.culturalClosings[category];
      const randomClosing = closings[Math.floor(Math.random() * closings.length)];
      
      // Ensure proper punctuation before adding closing
      if (!content.endsWith('.') && !content.endsWith('!') && !content.endsWith('?')) {
        content += '.';
      }
      
      content += ` ${randomClosing}`;
    }

    return content;
  }

  /**
   * Improves sentence flow and readability
   */
  private improveFlow(content: string): string {
    // Fix common flow issues
    let improved = content
      // Fix double spaces
      .replace(/\s+/g, ' ')
      // Fix spacing around punctuation
      .replace(/\s+([,.!?])/g, '$1')
      .replace(/([,.!?])([A-Z])/g, '$1 $2')
      // Ensure proper capitalization after periods
      .replace(/\.\s*([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`)
      // Fix exclamation and question marks
      .replace(/!\s*([a-z])/g, (match, letter) => `! ${letter.toUpperCase()}`)
      .replace(/\?\s*([a-z])/g, (match, letter) => `? ${letter.toUpperCase()}`)
      .trim();

    // Ensure first letter is capitalized
    if (improved.length > 0) {
      improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    }

    return improved;
  }

  /**
   * Gets category-specific suggestions for errors
   */
  private getCategorySuggestions(category: Category): string {
    const suggestions: Record<Category, string> = {
      slang: 'Try asking about greeting expressions, emotional expressions, or casual conversation!',
      food: 'Try asking about street food, breakfast items, or snacks from different cities!',
      festival: 'Try asking about Ugadi, Sankranti, or Dussehra celebrations!',
      emotion: 'Try asking about food for when you\'re happy, sad, tired, or excited!'
    };

    return suggestions[category] || 'Try exploring different cultural topics!';
  }

  /**
   * Validates response format meets requirements
   * Requirements: 2.2, 2.3, 2.5 - Format validation
   */
  validateResponseFormat(content: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for Telugu words (at least one should be present)
    const teluguWords = ['babu', 'amma', 'arey', 'baboi', 'pappu', 'avakaya', 'rasam', 'biryani', 'panduga', 'santosham'];
    const hasTeluguWord = teluguWords.some(word => content.toLowerCase().includes(word));
    if (!hasTeluguWord) {
      issues.push('Response should include Telugu vocabulary');
    }

    // Check for technical terms (should not be present)
    const technicalTerms = ['API', 'database', 'dataset', 'training', 'algorithm', 'system'];
    const hasTechnicalTerms = technicalTerms.some(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
    if (hasTechnicalTerms) {
      issues.push('Response contains technical implementation details');
    }

    // Check for cultural warmth
    const warmthIndicators = ['trust me', 'you know', 'let me tell', 'pakka', 'believe', 'honestly', 'arey', 'baboi'];
    const hasWarmth = warmthIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
    if (!hasWarmth) {
      issues.push('Response should have warm, friendly tone');
    }

    // Check for proper sentence structure
    if (!content.trim().endsWith('.') && !content.trim().endsWith('!') && !content.trim().endsWith('?')) {
      issues.push('Response should end with proper punctuation');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}