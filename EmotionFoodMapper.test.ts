import { describe, it, expect } from 'vitest';
import { EmotionFoodMapperImpl } from './EmotionFoodMapperImpl';

describe('EmotionFoodMapper Example Tests', () => {
  const emotionMapper = new EmotionFoodMapperImpl();

  /**
   * **Example 1: Sadness emotion mapping**
   * **Validates: Requirements 4.1**
   */
  it('should recommend Pappu with Avakaya for sadness', () => {
    // Act
    const recommendation = emotionMapper.mapEmotionToFood('sad');
    
    // Assert
    expect(recommendation.food).toBe('Pappu with Avakaya');
    expect(recommendation.reasoning.toLowerCase()).toContain('comfort');
    expect(recommendation.reasoning.toLowerCase()).toContain('nostalgia');
    expect(recommendation.spiceLevel).toBe('medium');
    expect(recommendation.culturalContext).toContain('Andhra culture');
  });

  /**
   * **Example 2: Sickness emotion mapping**
   * **Validates: Requirements 4.2**
   */
  it('should recommend Rasam for sickness', () => {
    // Act
    const recommendation = emotionMapper.mapEmotionToFood('sick');
    
    // Assert
    expect(recommendation.food).toBe('Rasam');
    expect(recommendation.reasoning.toLowerCase()).toContain('healing');
    expect(recommendation.reasoning.toLowerCase()).toContain('pepper');
    expect(recommendation.spiceLevel).toBe('low');
    expect(recommendation.culturalContext).toContain('Andhra culture');
  });

  /**
   * **Example 3: Happiness emotion mapping**
   * **Validates: Requirements 4.3**
   */
  it('should recommend Biryani for happiness', () => {
    // Act
    const recommendation = emotionMapper.mapEmotionToFood('happy');
    
    // Assert
    expect(recommendation.food).toBe('Biryani');
    expect(recommendation.reasoning.toLowerCase()).toContain('celebratory');
    expect(recommendation.reasoning.toLowerCase()).toContain('joy');
    expect(recommendation.spiceLevel).toBe('high');
    expect(recommendation.culturalContext).toContain('Andhra culture');
  });

  /**
   * **Example 4: Anger emotion mapping**
   * **Validates: Requirements 4.4**
   */
  it('should recommend Curd Rice for anger', () => {
    // Act
    const recommendation = emotionMapper.mapEmotionToFood('angry');
    
    // Assert
    expect(recommendation.food).toBe('Curd Rice');
    expect(recommendation.reasoning.toLowerCase()).toContain('cooling');
    expect(recommendation.reasoning.toLowerCase()).toContain('calm');
    expect(recommendation.spiceLevel).toBe('low');
    expect(recommendation.culturalContext).toContain('Andhra culture');
  });

  /**
   * **Example 5: Tiredness emotion mapping**
   * **Validates: Requirements 4.5**
   */
  it('should recommend Coffee with Punugulu for tiredness', () => {
    // Act
    const recommendation = emotionMapper.mapEmotionToFood('tired');
    
    // Assert
    expect(recommendation.food).toBe('Coffee with Punugulu');
    expect(recommendation.reasoning.toLowerCase()).toContain('energy');
    expect(recommendation.reasoning.toLowerCase()).toContain('caffeine');
    expect(recommendation.spiceLevel).toBe('medium');
    expect(recommendation.culturalContext).toContain('Andhra culture');
  });

  it('should provide detailed emotional logic explanations for known emotions', () => {
    // Test sadness explanation
    const sadExplanation = emotionMapper.explainEmotionalLogic('sad', 'Pappu with Avakaya');
    expect(sadExplanation).toContain('comfort');
    expect(sadExplanation.toLowerCase()).toContain('arey');

    // Test sickness explanation
    const sickExplanation = emotionMapper.explainEmotionalLogic('sick', 'Rasam');
    expect(sickExplanation).toContain('medicine');
    expect(sickExplanation.toLowerCase()).toContain('baboi');

    // Test happiness explanation
    const happyExplanation = emotionMapper.explainEmotionalLogic('happy', 'Biryani');
    expect(happyExplanation).toContain('celebration');
    expect(happyExplanation.toLowerCase()).toContain('scene');

    // Test anger explanation
    const angryExplanation = emotionMapper.explainEmotionalLogic('angry', 'Curd Rice');
    expect(angryExplanation).toContain('coolant');
    expect(angryExplanation.toLowerCase()).toContain('lite teesko');

    // Test tiredness explanation
    const tiredExplanation = emotionMapper.explainEmotionalLogic('tired', 'Coffee with Punugulu');
    expect(tiredExplanation).toContain('energy');
    expect(tiredExplanation.toLowerCase()).toContain('taggede le');
  });

  it('should handle case-insensitive emotion inputs', () => {
    const lowerCase = emotionMapper.mapEmotionToFood('sad');
    const upperCase = emotionMapper.mapEmotionToFood('SAD');
    const mixedCase = emotionMapper.mapEmotionToFood('SaD');
    
    expect(lowerCase.food).toBe(upperCase.food);
    expect(lowerCase.food).toBe(mixedCase.food);
  });

  it('should provide fallback recommendation for unknown emotions', () => {
    const recommendation = emotionMapper.mapEmotionToFood('confused');
    
    expect(recommendation.food).toBe('Pappu with Avakaya');
    expect(recommendation.reasoning).toContain('comfort food');
    expect(recommendation.reasoning.toLowerCase()).toContain('ra');
  });
});