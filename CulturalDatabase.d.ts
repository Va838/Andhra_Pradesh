import { SlangInfo, FoodInfo, FestivalInfo, EmotionFoodMapping, FoodPreferences } from '../types';
export interface CulturalDatabase {
    getSlangInfo(term: string): SlangInfo | null;
    getFoodInfo(city: string, preferences: FoodPreferences): FoodInfo[];
    getFestivalInfo(festival: string): FestivalInfo | null;
    getEmotionFoodMapping(emotion: string): EmotionFoodMapping | null;
}
//# sourceMappingURL=CulturalDatabase.d.ts.map