import { SlangInfo, FoodInfo, FestivalInfo, EmotionFoodMapping } from '../types';
export declare class DataValidator {
    static validateSlangInfo(slang: any): slang is SlangInfo;
    static validateFoodInfo(food: any): food is FoodInfo;
    static validateFestivalInfo(festival: any): festival is FestivalInfo;
    static validateEmotionFoodMapping(mapping: any): mapping is EmotionFoodMapping;
    static validateDataCompleteness(data: {
        slang: SlangInfo[];
        food: FoodInfo[];
        festivals: FestivalInfo[];
        emotions: EmotionFoodMapping[];
    }): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=DataValidator.d.ts.map