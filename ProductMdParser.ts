import * as fs from 'fs';
import * as path from 'path';
import { 
  SlangInfo, 
  FoodInfo, 
  FestivalInfo, 
  EmotionFoodMapping,
  RegionalVariation,
  Region,
  HomeVsStreet
} from '../types';
import { DataValidator } from './DataValidator';

export interface ParsedCulturalData {
  slang: SlangInfo[];
  food: FoodInfo[];
  festivals: FestivalInfo[];
  emotions: EmotionFoodMapping[];
}

export class ProductMdParser {
  private productMdPath: string;
  
  constructor(productMdPath: string = 'product.md') {
    this.productMdPath = productMdPath;
  }

  public parseProductMd(): ParsedCulturalData {
    try {
      const content = fs.readFileSync(this.productMdPath, 'utf-8');
      return this.parseContent(content);
    } catch (error) {
      throw new Error(`Failed to read product.md: ${error}`);
    }
  }

  private parseContent(content: string): ParsedCulturalData {
    const sections = this.extractSections(content);
    
    return {
      slang: this.parseSlangSection(sections.slang || ''),
      food: this.parseFoodSection(sections.food || ''),
      festivals: this.parseFestivalSection(sections.festivals || ''),
      emotions: this.parseEmotionSection(sections.emotions || '')
    };
  }

  private extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // Extract slang section
    const slangMatch = content.match(/🗣️ Andhra Slang Intelligence([\s\S]*?)(?=🍗|$)/);
    if (slangMatch) {
      sections.slang = slangMatch[1];
    }
    
    // Extract food section
    const foodMatch = content.match(/🍗 Andhra Street Food Culture([\s\S]*?)(?=🎉|$)/);
    if (foodMatch) {
      sections.food = foodMatch[1];
    }
    
    // Extract festival section
    const festivalMatch = content.match(/🎉 Festivals of Andhra Pradesh([\s\S]*?)(?=❤️|$)/);
    if (festivalMatch) {
      sections.festivals = festivalMatch[1];
    }
    
    // Extract emotion section
    const emotionMatch = content.match(/❤️ Emotional Food Mapping([\s\S]*?)(?=🎛️|$)/);
    if (emotionMatch) {
      sections.emotions = emotionMatch[1];
    }
    
    return sections;
  }

  private parseSlangSection(content: string): SlangInfo[] {
    const slangItems: SlangInfo[] = [];
    
    // Extract slang entries using quotes as delimiters
    const slangMatches = content.match(/"([^"]+)"/g);
    if (!slangMatches) return slangItems;
    
    const slangTerms = slangMatches.map(match => match.replace(/"/g, ''));
    
    for (const term of slangTerms) {
      const slangInfo = this.parseSlangTerm(content, term);
      if (slangInfo && DataValidator.validateSlangInfo(slangInfo)) {
        slangItems.push(slangInfo);
      }
    }
    
    return slangItems;
  }

  private parseSlangTerm(content: string, term: string): SlangInfo | null {
    // Find the section for this specific term
    const termRegex = new RegExp(`"${this.escapeRegex(term)}"([\\s\\S]*?)(?="[^"]*"|$)`, 'i');
    const termMatch = content.match(termRegex);
    
    if (!termMatch) return null;
    
    const termContent = termMatch[1];
    
    // Extract meaning - look for "Literal:" or "Meaning:"
    const meaningMatch = termContent.match(/(?:Literal|Meaning):\s*([^\n]+)/i);
    const literalMeaning = meaningMatch ? meaningMatch[1].trim() : '';
    
    // Extract emotional meaning
    const emotionMatch = termContent.match(/(?:Emotional meaning|Emotion):\s*([^\n]+)/i);
    const emotionalIntent = emotionMatch ? emotionMatch[1].trim() : '';
    
    // Extract usage/appropriateness
    const usageMatch = termContent.match(/(?:Usage|Use):\s*([^\n]+)/i);
    let socialAppropriateness = usageMatch ? usageMatch[1].trim() : '';
    
    // Also check for "Avoid" statements
    const avoidMatch = termContent.match(/Avoid\s+([^\n]+)/i);
    if (avoidMatch) {
      socialAppropriateness += (socialAppropriateness ? '; ' : '') + 'Avoid ' + avoidMatch[1].trim();
    }
    
    if (!socialAppropriateness) {
      socialAppropriateness = 'General use';
    }
    
    // Determine formality level
    const formalityLevel = termContent.toLowerCase().includes('formal') ? 'formal' : 'informal';
    
    if (!literalMeaning || !emotionalIntent) {
      return null;
    }
    
    return {
      term,
      literalMeaning,
      emotionalIntent,
      socialAppropriateness,
      formalityLevel,
      regionalVariations: []
    };
  }

  private parseFoodSection(content: string): FoodInfo[] {
    const foodItems: FoodInfo[] = [];
    
    // Split content by lines and process
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentCity = '';
    
    for (const line of lines) {
      // Skip section headers
      if (line.includes('🍗') || line.includes('Food Principles') || line.includes('City-wise')) {
        continue;
      }
      
      // Check if this is a city header (no arrow, contains city name)
      if (!line.includes('→') && (
        line.includes('Visakhapatnam') || 
        line.includes('Vijayawada') || 
        line.includes('Guntur') || 
        line.includes('Tirupati')
      )) {
        currentCity = this.extractCityName(line) || '';
        continue;
      }
      
      // Check if this is a food item (contains arrow)
      if (line.includes('→') && currentCity) {
        const foodInfo = this.parseFoodLine(line, currentCity);
        if (foodInfo && DataValidator.validateFoodInfo(foodInfo)) {
          foodItems.push(foodInfo);
        }
      }
    }
    
    return foodItems;
  }

  private extractCityName(cityLine: string): string | null {
    // Handle formats like "Visakhapatnam (Vizag)" or "Guntur"
    const match = cityLine.match(/^([A-Za-z\s]+)(?:\s*\([^)]+\))?/);
    return match ? match[1].trim() : null;
  }

  private parseFoodLine(line: string, city: string): FoodInfo | null {
    // Parse lines like "Punugulu → medium spice" or "Idli with Karam → spicy breakfast"
    const parts = line.split('→');
    if (parts.length !== 2) return null;
    
    const name = parts[0].trim();
    const description = parts[1].trim();
    
    // Extract spice level
    let spiceLevel = 'medium';
    if (description.toLowerCase().includes('extreme')) spiceLevel = 'extreme';
    else if (description.toLowerCase().includes('high') || description.toLowerCase().includes('spicy')) spiceLevel = 'high';
    else if (description.toLowerCase().includes('low') || description.toLowerCase().includes('mild')) spiceLevel = 'low';
    
    // Extract best time
    let bestTime = 'Evening';
    if (description.toLowerCase().includes('breakfast') || description.toLowerCase().includes('morning')) bestTime = 'Morning';
    else if (description.toLowerCase().includes('lunch')) bestTime = 'Lunch';
    else if (description.toLowerCase().includes('evening')) bestTime = 'Evening';
    
    return {
      name,
      city,
      spiceLevel,
      bestTime,
      description,
      culturalSignificance: `Traditional ${city} specialty`
    };
  }

  private parseFestivalSection(content: string): FestivalInfo[] {
    const festivals: FestivalInfo[] = [];
    
    // Split content by lines and process
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentFestival = '';
    let festivalData: any = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip section headers
      if (line.includes('🎉') || line.includes('Festivals')) {
        continue;
      }
      
      // Check if this is a festival name (single word, capitalized)
      if (line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/) && !line.includes(':')) {
        // Save previous festival if we have one
        if (currentFestival && festivalData.culturalMeaning && festivalData.associatedFoods) {
          const festival: FestivalInfo = {
            name: currentFestival,
            culturalMeaning: festivalData.culturalMeaning,
            associatedFoods: festivalData.associatedFoods,
            foodSymbolism: festivalData.foodSymbolism || `Traditional foods representing the spirit of ${currentFestival}`,
            emotionalTone: festivalData.emotionalTone || 'Celebratory'
          };
          
          if (DataValidator.validateFestivalInfo(festival)) {
            festivals.push(festival);
          }
        }
        
        // Start new festival
        currentFestival = line;
        festivalData = {};
        continue;
      }
      
      // Parse festival details
      if (currentFestival) {
        if (line.toLowerCase().includes('festival') || line.toLowerCase().includes('worship') || line.toLowerCase().includes('celebration')) {
          festivalData.culturalMeaning = line;
        } else if (line.toLowerCase().startsWith('foods:') || line.toLowerCase().startsWith('food:')) {
          const foodsText = line.replace(/^foods?:\s*/i, '');
          festivalData.associatedFoods = foodsText.split(',').map(f => f.trim());
        } else if (line.toLowerCase().includes('emotional tone:')) {
          festivalData.emotionalTone = line.replace(/.*emotional tone:\s*/i, '');
        } else if (line.toLowerCase().includes('symbolizes') || line.toLowerCase().includes('represents')) {
          festivalData.foodSymbolism = line;
        }
      }
    }
    
    // Don't forget the last festival
    if (currentFestival && festivalData.culturalMeaning && festivalData.associatedFoods) {
      const festival: FestivalInfo = {
        name: currentFestival,
        culturalMeaning: festivalData.culturalMeaning,
        associatedFoods: festivalData.associatedFoods,
        foodSymbolism: festivalData.foodSymbolism || `Traditional foods representing the spirit of ${currentFestival}`,
        emotionalTone: festivalData.emotionalTone || 'Celebratory'
      };
      
      if (DataValidator.validateFestivalInfo(festival)) {
        festivals.push(festival);
      }
    }
    
    return festivals;
  }

  private parseEmotionSection(content: string): EmotionFoodMapping[] {
    const emotions: EmotionFoodMapping[] = [];
    
    // Extract emotion mappings using the format "Emotion → Food"
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip headers
      if (line.includes('❤️') || line.includes('Emotional') || line.includes('Core Belief') || line.includes('Mood')) {
        continue;
      }
      
      // Look for emotion mappings
      if (line.includes('→')) {
        const parts = line.split('→');
        if (parts.length !== 2) continue;
        
        const emotion = parts[0].trim().toLowerCase();
        const foodLine = parts[1].trim();
        
        // Extract food name (before parentheses or additional text)
        const recommendedFood = foodLine.split('(')[0].trim();
        
        // Look for emotional logic in the next line (in parentheses)
        let emotionalLogic = '';
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const logicMatch = nextLine.match(/^\(([^)]+)\)/);
          if (logicMatch) {
            emotionalLogic = logicMatch[1].trim();
          }
        }
        
        // Also check if logic is in the same line
        if (!emotionalLogic) {
          const inlineLogicMatch = foodLine.match(/\(([^)]+)\)/);
          if (inlineLogicMatch) {
            emotionalLogic = inlineLogicMatch[1].trim();
          }
        }
        
        if (!emotionalLogic) {
          emotionalLogic = `${recommendedFood} is culturally appropriate for ${emotion} feelings`;
        }
        
        // Determine home vs street based on food type
        let homeVsStreet: HomeVsStreet = 'both';
        const foodLower = recommendedFood.toLowerCase();
        if (foodLower.includes('coffee') || foodLower.includes('punugulu')) {
          homeVsStreet = 'street';
        } else if (foodLower.includes('pappu') || foodLower.includes('rasam') || foodLower.includes('curd rice')) {
          homeVsStreet = 'home';
        }
        
        const mapping: EmotionFoodMapping = {
          emotion,
          recommendedFood,
          emotionalLogic,
          homeVsStreet
        };
        
        if (DataValidator.validateEmotionFoodMapping(mapping)) {
          emotions.push(mapping);
        }
      }
    }
    
    return emotions;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public validateParsedData(data: ParsedCulturalData): { isValid: boolean; errors: string[] } {
    return DataValidator.validateDataCompleteness(data);
  }
}