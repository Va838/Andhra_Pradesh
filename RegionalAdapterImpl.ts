import { RegionalAdapter } from '../interfaces/RegionalAdapter';
import { UserInput, Region } from '../types';

export class RegionalAdapterImpl implements RegionalAdapter {
  
  /**
   * Detects the region based on user input preferences or defaults to coastal
   */
  detectRegion(input: UserInput): Region {
    // If user explicitly specified a region preference, use it
    if (input.preferences?.region) {
      return input.preferences.region;
    }
    
    // Default to coastal region if no preference specified
    return 'coastal';
  }

  /**
   * Adapts tone and language style based on the specific Andhra region
   * Requirements 3.1, 3.2, 3.3: Regional tone adaptation
   */
  adaptTone(content: string, region: Region): string {
    switch (region) {
      case 'coastal':
        // Coastal Andhra: soft slang references, gentle tone
        return this.applyCoastalTone(content);
      
      case 'guntur':
        // Guntur: bold language, direct style
        return this.applyGunturTone(content);
      
      case 'rayalaseema':
        // Rayalaseema: rustic tone, simple references
        return this.applyRayalaseemaTone(content);
      
      default:
        return content;
    }
  }

  /**
   * Gets region-specific specialties for food recommendations
   * Requirements 3.4, 3.5: Regional specialties and preferences
   */
  getRegionalSpecialties(category: string, region: Region): string[] {
    const specialties: Record<Region, Record<string, string[]>> = {
      coastal: {
        food: ['Pulihora', 'Gongura Pachadi', 'Royyala Curry', 'Pesarattu', 'Kakinada Kaja', 'Bobbatlu'],
        slang: ['Babu', 'Amma', 'Chinnodu', 'Pedda', 'Chinni'],
        spice: ['medium', 'high'],
        festival: ['Ugadi', 'Sankranti', 'Dussehra'],
        emotion: ['comfort', 'celebration', 'healing']
      },
      guntur: {
        food: ['Guntur Chicken', 'Karam Dosa', 'Mirchi Bajji', 'Gongura Mutton', 'Avakaya', 'Kandi Pachadi'],
        slang: ['Rey', 'Mama', 'Abba', 'Boss', 'Bhai'],
        spice: ['high', 'extreme'],
        festival: ['Ugadi', 'Sankranti', 'Vinayaka Chavithi'],
        emotion: ['energizing', 'bold', 'fiery']
      },
      rayalaseema: {
        food: ['Ragi Sangati', 'Natukodi Curry', 'Peanut Chutney', 'Jowar Roti', 'Mutton Curry', 'Bamboo Chicken'],
        slang: ['Anna', 'Ayya', 'Chelli', 'Tammudu', 'Akka'],
        spice: ['medium', 'high'],
        festival: ['Ugadi', 'Sankranti', 'Rama Navami'],
        emotion: ['traditional', 'rustic', 'simple']
      }
    };

    return specialties[region]?.[category] || [];
  }

  /**
   * Gets detailed regional food preferences including timing and preparation style
   * Requirements 3.4: Regional food specialties
   */
  getRegionalFoodPreferences(region: Region): {
    preferredSpiceLevel: string[];
    specialtyDishes: string[];
    preferredTiming: Record<string, string[]>;
    cookingStyle: string[];
  } {
    const preferences = {
      coastal: {
        preferredSpiceLevel: ['medium', 'high'],
        specialtyDishes: ['Pulihora', 'Gongura Pachadi', 'Royyala Curry', 'Pesarattu', 'Kakinada Kaja'],
        preferredTiming: {
          breakfast: ['Pesarattu', 'Upma', 'Idli'],
          lunch: ['Pulihora', 'Gongura Pachadi', 'Royyala Curry'],
          dinner: ['Fish Curry', 'Crab Curry', 'Prawn Fry'],
          snacks: ['Kakinada Kaja', 'Murukku', 'Mixture']
        },
        cookingStyle: ['coconut-based', 'tamarind-rich', 'seafood-focused', 'mild-spice']
      },
      guntur: {
        preferredSpiceLevel: ['high', 'extreme'],
        specialtyDishes: ['Guntur Chicken', 'Karam Dosa', 'Mirchi Bajji', 'Gongura Mutton', 'Avakaya'],
        preferredTiming: {
          breakfast: ['Karam Dosa', 'Mirchi Bajji', 'Punugulu'],
          lunch: ['Guntur Chicken', 'Gongura Mutton', 'Kandi Pachadi'],
          dinner: ['Spicy Biryani', 'Mutton Curry', 'Chicken Fry'],
          snacks: ['Mirchi Bajji', 'Bonda', 'Pakoda']
        },
        cookingStyle: ['extra-spicy', 'red-chili-heavy', 'bold-flavors', 'oil-rich']
      },
      rayalaseema: {
        preferredSpiceLevel: ['medium', 'high'],
        specialtyDishes: ['Ragi Sangati', 'Natukodi Curry', 'Peanut Chutney', 'Jowar Roti', 'Bamboo Chicken'],
        preferredTiming: {
          breakfast: ['Ragi Sangati', 'Jowar Roti', 'Bajra Roti'],
          lunch: ['Natukodi Curry', 'Mutton Curry', 'Peanut Chutney'],
          dinner: ['Bamboo Chicken', 'Country Chicken', 'Ragi Mudde'],
          snacks: ['Groundnut Laddu', 'Sesame Balls', 'Jaggery Sweets']
        },
        cookingStyle: ['traditional', 'rustic', 'millet-based', 'country-style']
      }
    };

    return preferences[region];
  }

  /**
   * Gets regional slang variations with context and usage
   * Requirements 3.5: Regional slang variations
   */
  getDetailedRegionalSlang(region: Region): {
    greetings: string[];
    expressions: string[];
    relationships: string[];
    emotions: string[];
    usage: Record<string, string>;
  } {
    const slangData = {
      coastal: {
        greetings: ['Babu', 'Amma', 'Chinnodu'],
        expressions: ['Chala bagundi', 'Superb kada', 'Emi chestunnav'],
        relationships: ['Pedda', 'Chinni', 'Mama', 'Mami'],
        emotions: ['Santosham', 'Badha', 'Kopam'],
        usage: {
          'Babu': 'Gentle way to address someone, shows affection',
          'Amma': 'Motherly address, very respectful',
          'Chinnodu': 'Little one, used for younger people'
        }
      },
      guntur: {
        greetings: ['Rey', 'Mama', 'Abba'],
        expressions: ['Pakka guarantee', 'Super spicy', 'Emi ra'],
        relationships: ['Boss', 'Bhai', 'Anna', 'Thammudu'],
        emotions: ['Josh', 'Fire', 'Kick'],
        usage: {
          'Rey': 'Bold, direct way to call someone',
          'Mama': 'Friendly address for peers',
          'Abba': 'Expression of surprise or emphasis'
        }
      },
      rayalaseema: {
        greetings: ['Anna', 'Ayya', 'Chelli'],
        expressions: ['Simple ga', 'Traditional ga', 'Manchi vishayam'],
        relationships: ['Tammudu', 'Akka', 'Vadina', 'Babai'],
        emotions: ['Shantham', 'Goppa', 'Manchidi'],
        usage: {
          'Anna': 'Respectful address for elder brother or senior',
          'Ayya': 'Very respectful address, shows reverence',
          'Chelli': 'Affectionate address for younger sister'
        }
      }
    };

    return slangData[region];
  }

  /**
   * Applies Coastal Andhra tone - soft and gentle
   */
  private applyCoastalTone(content: string): string {
    // Add gentle expressions and soft slang
    const coastalPhrases = [
      'Babu, ',
      'Amma, ',
      ', kada?',
      ', le',
      'Chala bagundi, '
    ];
    
    // Randomly add coastal expressions (simplified for implementation)
    if (Math.random() > 0.7) {
      const phrase = coastalPhrases[Math.floor(Math.random() * coastalPhrases.length)];
      if (phrase.endsWith(', ')) {
        content = phrase + content;
      } else {
        content = content + phrase;
      }
    }
    
    return content;
  }

  /**
   * Applies Guntur tone - bold and direct
   */
  private applyGunturTone(content: string): string {
    // Add bold expressions and direct language
    const gunturPhrases = [
      'Rey, ',
      'Mama, ',
      '! Pakka guarantee!',
      ', abba!',
      'Super spicy, '
    ];
    
    // Add emphasis and bold expressions
    if (Math.random() > 0.6) {
      const phrase = gunturPhrases[Math.floor(Math.random() * gunturPhrases.length)];
      if (phrase.endsWith(', ')) {
        content = phrase + content;
      } else {
        content = content + phrase;
      }
    }
    
    return content;
  }

  /**
   * Applies Rayalaseema tone - rustic and simple
   */
  private applyRayalaseemaTone(content: string): string {
    // Add rustic expressions and simple language
    const rayalaseemaPhrases = [
      'Anna, ',
      'Ayya, ',
      ', chelli',
      ', simple ga',
      'Traditional ga, '
    ];
    
    // Add rustic expressions
    if (Math.random() > 0.7) {
      const phrase = rayalaseemaPhrases[Math.floor(Math.random() * rayalaseemaPhrases.length)];
      if (phrase.endsWith(', ')) {
        content = phrase + content;
      } else {
        content = content + phrase;
      }
    }
    
    return content;
  }

  /**
   * Gets spice preference level for a region
   */
  getRegionalSpicePreference(region: Region): string[] {
    const spicePreferences: Record<Region, string[]> = {
      coastal: ['medium', 'high'],
      guntur: ['high', 'extreme'],
      rayalaseema: ['medium', 'high']
    };
    
    return spicePreferences[region] || ['medium'];
  }

  /**
   * Gets regional slang variations for a term
   */
  getRegionalSlangVariations(term: string, region: Region): string[] {
    const slangData = this.getDetailedRegionalSlang(region);
    
    // Return all slang categories for the region
    return [
      ...slangData.greetings,
      ...slangData.expressions,
      ...slangData.relationships,
      ...slangData.emotions
    ];
  }

  /**
   * Gets cultural context for regional adaptation
   */
  getRegionalCulturalContext(region: Region): {
    tone: string;
    characteristics: string[];
    values: string[];
  } {
    const contexts = {
      coastal: {
        tone: 'gentle and soft',
        characteristics: ['hospitable', 'seafood-loving', 'trade-oriented', 'moderate'],
        values: ['respect for elders', 'family bonds', 'cultural traditions', 'education']
      },
      guntur: {
        tone: 'bold and direct',
        characteristics: ['spice-loving', 'energetic', 'business-minded', 'straightforward'],
        values: ['honesty', 'hard work', 'entrepreneurship', 'boldness']
      },
      rayalaseema: {
        tone: 'rustic and traditional',
        characteristics: ['agriculture-focused', 'simple', 'traditional', 'community-oriented'],
        values: ['simplicity', 'tradition', 'community support', 'agricultural heritage']
      }
    };

    return contexts[region];
  }
}