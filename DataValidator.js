"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidator = void 0;
class DataValidator {
    static validateSlangInfo(slang) {
        if (!slang || typeof slang !== 'object')
            return false;
        const requiredFields = [
            'term', 'literalMeaning', 'emotionalIntent',
            'socialAppropriateness', 'formalityLevel'
        ];
        for (const field of requiredFields) {
            if (!slang[field] || typeof slang[field] !== 'string' || slang[field].trim() === '') {
                return false;
            }
        }
        // Validate formality level
        const validFormalityLevels = ['formal', 'informal'];
        if (!validFormalityLevels.includes(slang.formalityLevel)) {
            return false;
        }
        // Validate regional variations if present
        if (slang.regionalVariations) {
            if (!Array.isArray(slang.regionalVariations))
                return false;
            for (const variation of slang.regionalVariations) {
                if (!variation.region || !variation.variation)
                    return false;
            }
        }
        return true;
    }
    static validateFoodInfo(food) {
        if (!food || typeof food !== 'object')
            return false;
        const requiredFields = ['name', 'city', 'spiceLevel', 'bestTime', 'description'];
        for (const field of requiredFields) {
            if (!food[field] || typeof food[field] !== 'string' || food[field].trim() === '') {
                return false;
            }
        }
        // Validate spice level
        const validSpiceLevels = ['low', 'medium', 'high', 'extreme'];
        if (!validSpiceLevels.includes(food.spiceLevel)) {
            return false;
        }
        // Validate best time format
        const validTimes = ['Morning', 'Lunch', 'Evening', 'Any'];
        if (!validTimes.some(time => food.bestTime.includes(time))) {
            return false;
        }
        return true;
    }
    static validateFestivalInfo(festival) {
        if (!festival || typeof festival !== 'object')
            return false;
        const requiredFields = ['name', 'culturalMeaning', 'foodSymbolism', 'emotionalTone'];
        for (const field of requiredFields) {
            if (!festival[field] || typeof festival[field] !== 'string' || festival[field].trim() === '') {
                return false;
            }
        }
        // Validate associated foods
        if (!festival.associatedFoods || !Array.isArray(festival.associatedFoods) || festival.associatedFoods.length === 0) {
            return false;
        }
        for (const food of festival.associatedFoods) {
            if (typeof food !== 'string' || food.trim() === '') {
                return false;
            }
        }
        // Validate regional variations if present
        if (festival.regionalVariations) {
            if (!Array.isArray(festival.regionalVariations))
                return false;
            for (const variation of festival.regionalVariations) {
                if (!variation.region || !variation.variation)
                    return false;
            }
        }
        return true;
    }
    static validateEmotionFoodMapping(mapping) {
        if (!mapping || typeof mapping !== 'object')
            return false;
        const requiredFields = ['emotion', 'recommendedFood', 'emotionalLogic', 'homeVsStreet'];
        for (const field of requiredFields) {
            if (!mapping[field] || typeof mapping[field] !== 'string' || mapping[field].trim() === '') {
                return false;
            }
        }
        // Validate homeVsStreet
        const validHomeVsStreet = ['home', 'street', 'both'];
        if (!validHomeVsStreet.includes(mapping.homeVsStreet)) {
            return false;
        }
        // Validate emotion format (should be lowercase)
        if (mapping.emotion !== mapping.emotion.toLowerCase()) {
            return false;
        }
        return true;
    }
    static validateDataCompleteness(data) {
        const errors = [];
        // Check minimum data requirements
        if (data.slang.length === 0) {
            errors.push("No slang data provided");
        }
        if (data.food.length === 0) {
            errors.push("No food data provided");
        }
        if (data.festivals.length === 0) {
            errors.push("No festival data provided");
        }
        if (data.emotions.length === 0) {
            errors.push("No emotion-food mapping data provided");
        }
        // Check for required emotions (from requirements)
        const requiredEmotions = ['sad', 'sick', 'happy', 'angry', 'tired'];
        const providedEmotions = data.emotions.map(e => e.emotion.toLowerCase());
        for (const emotion of requiredEmotions) {
            if (!providedEmotions.includes(emotion)) {
                errors.push(`Missing required emotion mapping: ${emotion}`);
            }
        }
        // Check for required cities (from product.md)
        const requiredCities = ['visakhapatnam', 'vijayawada', 'guntur', 'tirupati'];
        const providedCities = [...new Set(data.food.map(f => f.city.toLowerCase()))];
        for (const city of requiredCities) {
            if (!providedCities.includes(city)) {
                errors.push(`Missing food data for required city: ${city}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.DataValidator = DataValidator;
//# sourceMappingURL=DataValidator.js.map