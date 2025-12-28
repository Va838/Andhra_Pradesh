import { FoodRecommendation, UserPreferences } from '../types';

export interface EmotionFoodMapper {
  mapEmotionToFood(emotion: string): FoodRecommendation;
  explainEmotionalLogic(emotion: string, food: string): string;
  considerPreferences(recommendation: FoodRecommendation, preferences: UserPreferences): FoodRecommendation;
}