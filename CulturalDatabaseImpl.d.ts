import { SlangInfo, FoodInfo, FestivalInfo, EmotionFoodMapping, FoodPreferences, FallbackResponse } from '../types';
import { CulturalDatabase } from '../interfaces/CulturalDatabase';
export declare class CulturalDatabaseImpl implements CulturalDatabase {
    private slangData;
    private foodData;
    private festivalData;
    private emotionFoodData;
    private isLoaded;
    private parser;
    constructor(productMdPath?: string);
    private loadCulturalData;
    private loadFromParsedData;
    private loadHardcodedData;
    private loadSlangData;
    private loadFoodData;
    private loadFestivalData;
    private loadEmotionFoodData;
    validateSlangInfo(slang: SlangInfo): boolean;
    validateFoodInfo(food: FoodInfo): boolean;
    validateFestivalInfo(festival: FestivalInfo): boolean;
    validateEmotionFoodMapping(mapping: EmotionFoodMapping): boolean;
    getSlangInfo(term: string): SlangInfo | null;
    getFoodInfo(city: string, preferences: FoodPreferences): FoodInfo[];
    getFestivalInfo(festival: string): FestivalInfo | null;
    getEmotionFoodMapping(emotion: string): EmotionFoodMapping | null;
    getAllSlangTerms(): string[];
    getAllCities(): string[];
    getAllFestivals(): string[];
    getAllEmotions(): string[];
    isDataLoaded(): boolean;
    /**
     * Gets slang info with fallback response for missing data
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getSlangInfoWithFallback(term: string): SlangInfo | FallbackResponse;
    /**
     * Gets food info with fallback response for missing data
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getFoodInfoWithFallback(city: string, preferences: FoodPreferences): FoodInfo[] | FallbackResponse;
    /**
     * Gets festival info with fallback response for missing data
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getFestivalInfoWithFallback(festival: string): FestivalInfo | FallbackResponse;
    /**
     * Gets emotion mapping with fallback response for missing data
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getEmotionFoodMappingWithFallback(emotion: string): EmotionFoodMapping | FallbackResponse;
}
//# sourceMappingURL=CulturalDatabaseImpl.d.ts.map