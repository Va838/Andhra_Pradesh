import { EmotionFoodMapper } from '../interfaces/EmotionFoodMapper';
import { FoodRecommendation, UserPreferences, SpiceLevel, DietaryPreference } from '../types';

export class EmotionFoodMapperImpl implements EmotionFoodMapper {
  private emotionMappings: Map<string, { food: string; reasoning: string; spiceLevel: SpiceLevel; homeVsStreet: 'home' | 'street' | 'both' }>;

  constructor() {
    this.emotionMappings = new Map([
      ['sad', {
        food: 'Pappu with Avakaya',
        reasoning: 'Comfort food that brings nostalgia and warmth, like amma\'s cooking',
        spiceLevel: 'medium',
        homeVsStreet: 'home'
      }],
      ['sick', {
        food: 'Rasam',
        reasoning: 'Light, healing soup with pepper that soothes the body and aids digestion',
        spiceLevel: 'low',
        homeVsStreet: 'home'
      }],
      ['happy', {
        food: 'Biryani',
        reasoning: 'Celebratory feast food that matches the joy and festive mood',
        spiceLevel: 'high',
        homeVsStreet: 'street'
      }],
      ['angry', {
        food: 'Curd Rice',
        reasoning: 'Cooling effect that calms the mind and reduces body heat from anger',
        spiceLevel: 'low',
        homeVsStreet: 'home'
      }],
      ['tired', {
        food: 'Coffee with Punugulu',
        reasoning: 'Energy boost from caffeine paired with crispy snacks for quick satisfaction',
        spiceLevel: 'medium',
        homeVsStreet: 'street'
      }]
    ]);
  }

  mapEmotionToFood(emotion: string): FoodRecommendation {
    const normalizedEmotion = emotion.toLowerCase().trim();
    const mapping = this.emotionMappings.get(normalizedEmotion);
    
    if (!mapping) {
      // Fallback for unknown emotions - default to comfort food
      return {
        food: 'Pappu with Avakaya',
        reasoning: 'When in doubt, comfort food like pappu always helps, ra!',
        culturalContext: 'In Andhra culture, pappu is the ultimate comfort food that soothes any emotion',
        spiceLevel: 'medium'
      };
    }

    return {
      food: mapping.food,
      reasoning: mapping.reasoning,
      culturalContext: `In Andhra culture, food is emotional medicine - ${mapping.food} is perfect for when you're feeling ${emotion}`,
      spiceLevel: mapping.spiceLevel
    };
  }

  explainEmotionalLogic(emotion: string, food: string): string {
    const normalizedEmotion = emotion.toLowerCase().trim();
    const mapping = this.emotionMappings.get(normalizedEmotion);
    
    if (!mapping || mapping.food.toLowerCase() !== food.toLowerCase()) {
      return `This food choice might help balance your ${emotion} mood through Andhra food wisdom`;
    }

    // Add cultural context and Telugu expressions
    const explanations: Record<string, string> = {
      'sad': `Arey, when you're feeling low, nothing beats the comfort of pappu with avakaya. It's like amma's hug in food form - the tangy pickle cuts through sadness while the dal provides warmth and comfort.`,
      'sick': `Baboi, when you're not well, rasam is like liquid medicine! The pepper and tamarind help clear your system, and it's light on the stomach. Our elders always say "rasam tho everything will be fine."`,
      'happy': `Chala scene undi! When you're happy, only biryani can match that energy. It's celebration food - rich, flavorful, and meant to be shared with loved ones. Perfect for your joyful mood!`,
      'angry': `Lite teesko, when anger heats up your body, curd rice is the perfect coolant. The yogurt literally cools your system down, and the simple taste helps calm your mind. Very effective, trust me!`,
      'tired': `Taggede le! When you're exhausted, you need both caffeine and carbs. Coffee gives instant energy while punugulu provides that satisfying crunch and quick fuel. Perfect evening combo!`
    };

    return explanations[normalizedEmotion] || `This combination works well for your ${emotion} mood according to Andhra food traditions.`;
  }

  considerPreferences(recommendation: FoodRecommendation, preferences: UserPreferences): FoodRecommendation {
    let adaptedRecommendation = { ...recommendation };
    
    // Adjust for dietary preferences
    if (preferences.dietary === 'veg') {
      adaptedRecommendation = this.adaptForVegetarian(adaptedRecommendation);
    }
    
    // Adjust for spice level preferences
    if (preferences.spiceLevel) {
      adaptedRecommendation = this.adaptForSpiceLevel(adaptedRecommendation, preferences.spiceLevel);
    }
    
    // Adjust for regional preferences
    if (preferences.region) {
      adaptedRecommendation = this.adaptForRegion(adaptedRecommendation, preferences.region);
    }
    
    // Apply home vs street food logic based on emotion and preferences
    adaptedRecommendation = this.applyHomeVsStreetLogic(adaptedRecommendation, preferences);
    
    return adaptedRecommendation;
  }

  private adaptForVegetarian(recommendation: FoodRecommendation): FoodRecommendation {
    const vegAlternatives: Record<string, string> = {
      'Biryani': 'Veg Biryani with paneer',
      'Coffee with Punugulu': 'Coffee with Veg Punugulu'
    };
    
    const vegAlternative = vegAlternatives[recommendation.food];
    if (vegAlternative) {
      return {
        ...recommendation,
        food: vegAlternative,
        reasoning: recommendation.reasoning + ' (adapted for vegetarian preference)'
      };
    }
    
    return recommendation;
  }

  private adaptForSpiceLevel(recommendation: FoodRecommendation, preferredSpice: SpiceLevel): FoodRecommendation {
    if (recommendation.spiceLevel === preferredSpice) {
      return recommendation;
    }
    
    const spiceAdjustments: Record<SpiceLevel, string> = {
      'low': 'with mild spicing',
      'medium': 'with moderate spice level',
      'high': 'with good spice kick',
      'extreme': 'with maximum Guntur-style heat'
    };
    
    return {
      ...recommendation,
      food: `${recommendation.food} ${spiceAdjustments[preferredSpice]}`,
      spiceLevel: preferredSpice,
      reasoning: `${recommendation.reasoning} (adjusted to your ${preferredSpice} spice preference)`
    };
  }

  private adaptForRegion(recommendation: FoodRecommendation, region: string): FoodRecommendation {
    const regionalTouches: Record<string, string> = {
      'coastal': 'with coastal Andhra style preparation',
      'guntur': 'with extra Guntur mirchi for that authentic kick',
      'rayalaseema': 'prepared in traditional Rayalaseema style'
    };
    
    const regionalTouch = regionalTouches[region];
    if (regionalTouch) {
      return {
        ...recommendation,
        food: `${recommendation.food} ${regionalTouch}`,
        culturalContext: `${recommendation.culturalContext} This ${region} region preparation adds authentic local flavor.`
      };
    }
    
    return recommendation;
  }

  private applyHomeVsStreetLogic(recommendation: FoodRecommendation, preferences: UserPreferences): FoodRecommendation {
    // Determine if this should be home or street food based on emotion and preferences
    const homeEmotions = ['sad', 'sick', 'angry']; // Comfort/healing emotions prefer home food
    const streetEmotions = ['happy', 'tired']; // Social/energy emotions prefer street food
    
    // Extract emotion from the cultural context or reasoning
    const emotionContext = recommendation.culturalContext.toLowerCase() + ' ' + recommendation.reasoning.toLowerCase();
    
    let preferredSetting: 'home' | 'street' | 'both' = 'both';
    
    if (homeEmotions.some(emotion => emotionContext.includes(emotion))) {
      preferredSetting = 'home';
    } else if (streetEmotions.some(emotion => emotionContext.includes(emotion))) {
      preferredSetting = 'street';
    }
    
    // Apply home vs street adaptations
    if (preferredSetting === 'home') {
      return {
        ...recommendation,
        reasoning: `${recommendation.reasoning} Best enjoyed at home for that personal comfort.`,
        culturalContext: `${recommendation.culturalContext} Home-style preparation brings out the emotional healing aspect.`
      };
    } else if (preferredSetting === 'street') {
      return {
        ...recommendation,
        reasoning: `${recommendation.reasoning} Perfect to grab from your favorite local spot!`,
        culturalContext: `${recommendation.culturalContext} Street-style preparation adds that authentic local flavor and social energy.`
      };
    }
    
    return recommendation;
  }
}