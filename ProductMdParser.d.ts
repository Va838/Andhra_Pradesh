import { SlangInfo, FoodInfo, FestivalInfo, EmotionFoodMapping } from '../types';
export interface ParsedCulturalData {
    slang: SlangInfo[];
    food: FoodInfo[];
    festivals: FestivalInfo[];
    emotions: EmotionFoodMapping[];
}
export declare class ProductMdParser {
    private productMdPath;
    constructor(productMdPath?: string);
    parseProductMd(): ParsedCulturalData;
    private parseContent;
    private extractSections;
    private parseSlangSection;
    private parseSlangTerm;
    private parseFoodSection;
    private extractCityName;
    private parseFoodLine;
    private parseFestivalSection;
    private parseEmotionSection;
    private escapeRegex;
    validateParsedData(data: ParsedCulturalData): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=ProductMdParser.d.ts.map