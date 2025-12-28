"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CulturalDatabaseImpl = void 0;
const ProductMdParser_1 = require("./ProductMdParser");
const ErrorHandler_1 = require("../components/ErrorHandler");
class CulturalDatabaseImpl {
    constructor(productMdPath) {
        this.slangData = new Map();
        this.foodData = new Map();
        this.festivalData = new Map();
        this.emotionFoodData = new Map();
        this.isLoaded = false;
        this.parser = new ProductMdParser_1.ProductMdParser(productMdPath);
        this.loadCulturalData();
    }
    loadCulturalData() {
        try {
            // Try to load from product.md first
            const parsedData = this.parser.parseProductMd();
            this.loadFromParsedData(parsedData);
            // Validate the loaded data
            const validation = this.parser.validateParsedData(parsedData);
            if (!validation.isValid) {
                console.warn('Data validation warnings:', validation.errors);
                // Fall back to hardcoded data if parsing fails validation
                this.loadHardcodedData();
            }
        }
        catch (error) {
            console.warn('Failed to parse product.md, falling back to hardcoded data:', error);
            this.loadHardcodedData();
        }
        this.isLoaded = true;
    }
    loadFromParsedData(data) {
        // Load slang data
        data.slang.forEach(slang => {
            this.slangData.set(slang.term.toLowerCase(), slang);
        });
        // Load food data grouped by city
        data.food.forEach(food => {
            const cityKey = food.city.toLowerCase();
            if (!this.foodData.has(cityKey)) {
                this.foodData.set(cityKey, []);
            }
            this.foodData.get(cityKey).push(food);
        });
        // Load festival data
        data.festivals.forEach(festival => {
            this.festivalData.set(festival.name.toLowerCase(), festival);
        });
        // Load emotion-food mappings
        data.emotions.forEach(mapping => {
            this.emotionFoodData.set(mapping.emotion.toLowerCase(), mapping);
        });
    }
    loadHardcodedData() {
        this.loadSlangData();
        this.loadFoodData();
        this.loadFestivalData();
        this.loadEmotionFoodData();
    }
    loadSlangData() {
        const slangEntries = [
            {
                term: "Arey Baboi",
                literalMeaning: "Oh my God",
                emotionalIntent: "Shock / frustration / disbelief",
                socialAppropriateness: "Informal only",
                formalityLevel: "informal",
                regionalVariations: []
            },
            {
                term: "Doola Teerinda?",
                literalMeaning: "Are you out of your mind?",
                emotionalIntent: "Anger / scolding",
                socialAppropriateness: "Use only among close relations",
                formalityLevel: "informal"
            },
            {
                term: "Taggede Le",
                literalMeaning: "I won't step back",
                emotionalIntent: "Confidence / motivation",
                socialAppropriateness: "Often used humorously",
                formalityLevel: "informal"
            },
            {
                term: "Lite Teesko",
                literalMeaning: "Don't worry about it",
                emotionalIntent: "Comfort / casual dismissal",
                socialAppropriateness: "Casual conversations",
                formalityLevel: "informal"
            },
            {
                term: "Chala Scene Undi",
                literalMeaning: "Too much drama",
                emotionalIntent: "Sarcasm",
                socialAppropriateness: "Youth slang",
                formalityLevel: "informal"
            }
        ];
        slangEntries.forEach(slang => {
            this.slangData.set(slang.term.toLowerCase(), slang);
        });
    }
    loadFoodData() {
        const foodEntries = [
            // Visakhapatnam (Vizag)
            {
                name: "Punugulu",
                city: "Visakhapatnam",
                spiceLevel: "medium",
                bestTime: "Evening",
                description: "Deep-fried lentil balls, crispy outside and soft inside",
                culturalSignificance: "Popular evening snack near beach areas"
            },
            {
                name: "Bongulo Chicken",
                city: "Visakhapatnam",
                spiceLevel: "high",
                bestTime: "Evening",
                description: "Spicy chicken preparation with coastal flavors",
                culturalSignificance: "Coastal Andhra specialty with seafood influence"
            },
            // Vijayawada
            {
                name: "Idli with Karam",
                city: "Vijayawada",
                spiceLevel: "high",
                bestTime: "Morning",
                description: "Steamed rice cakes with spicy powder",
                culturalSignificance: "Traditional breakfast combining comfort with spice"
            },
            {
                name: "Chicken Pakodi",
                city: "Vijayawada",
                spiceLevel: "medium",
                bestTime: "Evening",
                description: "Spiced chicken fritters",
                culturalSignificance: "Popular evening snack in Krishna district"
            },
            // Guntur
            {
                name: "Mirchi Bajji",
                city: "Guntur",
                spiceLevel: "extreme",
                bestTime: "Evening",
                description: "Stuffed chili fritters",
                culturalSignificance: "Guntur's signature dish showcasing extreme spice tolerance"
            },
            {
                name: "Gongura Pachadi",
                city: "Guntur",
                spiceLevel: "high",
                bestTime: "Lunch",
                description: "Tangy sorrel leaves chutney",
                culturalSignificance: "Guntur's pride, represents bold flavors"
            },
            // Tirupati
            {
                name: "Dosa with Red Chutney",
                city: "Tirupati",
                spiceLevel: "medium",
                bestTime: "Morning",
                description: "Crispy crepe with spicy red chutney",
                culturalSignificance: "Temple town breakfast tradition"
            },
            {
                name: "Laddu",
                city: "Tirupati",
                spiceLevel: "low",
                bestTime: "Any",
                description: "Sweet gram flour balls",
                culturalSignificance: "Sacred temple prasadam, spiritually significant"
            },
            {
                name: "Vegetable Biryani",
                city: "Tirupati",
                spiceLevel: "medium",
                bestTime: "Evening",
                description: "Aromatic rice with mixed vegetables and spices",
                culturalSignificance: "Temple town vegetarian specialty for evening meals"
            },
            {
                name: "Curd Rice",
                city: "Tirupati",
                spiceLevel: "low",
                bestTime: "Evening",
                description: "Cooling rice with yogurt and mild tempering",
                culturalSignificance: "Temple town comfort food, perfect for evening"
            }
        ];
        // Group foods by city
        foodEntries.forEach(food => {
            const cityKey = food.city.toLowerCase();
            if (!this.foodData.has(cityKey)) {
                this.foodData.set(cityKey, []);
            }
            this.foodData.get(cityKey).push(food);
        });
    }
    loadFestivalData() {
        const festivalEntries = [
            {
                name: "Sankranti",
                culturalMeaning: "Harvest festival celebrating the transition of seasons and agricultural abundance",
                associatedFoods: ["Ariselu", "Pongal"],
                foodSymbolism: "Ariselu represents prosperity, Pongal symbolizes gratitude to nature",
                emotionalTone: "Family bonding and gratitude",
                regionalVariations: [
                    {
                        region: "coastal",
                        variation: "More emphasis on seafood preparations alongside traditional sweets"
                    },
                    {
                        region: "rayalaseema",
                        variation: "Focus on simple, rustic preparations with local grains"
                    }
                ]
            },
            {
                name: "Ugadi",
                culturalMeaning: "Telugu New Year symbolizing new beginnings and the balance of life experiences",
                associatedFoods: ["Ugadi Pachadi"],
                foodSymbolism: "Six tastes represent the full spectrum of life experiences - sweet, sour, salty, bitter, spicy, and astringent",
                emotionalTone: "Hope and renewal"
            },
            {
                name: "Vinayaka Chavithi",
                culturalMeaning: "Ganesh worship celebrating wisdom, prosperity, and removal of obstacles",
                associatedFoods: ["Modakam"],
                foodSymbolism: "Modakam represents the sweetness of devotion and Lord Ganesha's favorite offering",
                emotionalTone: "Joy and community celebration"
            }
        ];
        festivalEntries.forEach(festival => {
            this.festivalData.set(festival.name.toLowerCase(), festival);
        });
    }
    loadEmotionFoodData() {
        const emotionMappings = [
            {
                emotion: "sad",
                recommendedFood: "Pappu with Avakaya",
                emotionalLogic: "Comfort food that brings nostalgia and warmth, like mother's cooking",
                homeVsStreet: "home"
            },
            {
                emotion: "sick",
                recommendedFood: "Rasam",
                emotionalLogic: "Light, healing properties with digestive benefits and warmth",
                homeVsStreet: "home"
            },
            {
                emotion: "happy",
                recommendedFood: "Biryani",
                emotionalLogic: "Celebratory dish that represents abundance and festive mood",
                homeVsStreet: "both"
            },
            {
                emotion: "angry",
                recommendedFood: "Curd Rice",
                emotionalLogic: "Cooling effect that calms the mind and reduces heat in the body",
                homeVsStreet: "home"
            },
            {
                emotion: "tired",
                recommendedFood: "Coffee with Punugulu",
                emotionalLogic: "Energy boost from caffeine combined with satisfying evening snack",
                homeVsStreet: "street"
            }
        ];
        emotionMappings.forEach(mapping => {
            this.emotionFoodData.set(mapping.emotion.toLowerCase(), mapping);
        });
    }
    // Validation functions
    validateSlangInfo(slang) {
        return !!(slang.term &&
            slang.literalMeaning &&
            slang.emotionalIntent &&
            slang.socialAppropriateness &&
            slang.formalityLevel);
    }
    validateFoodInfo(food) {
        return !!(food.name &&
            food.city &&
            food.spiceLevel &&
            food.bestTime &&
            food.description);
    }
    validateFestivalInfo(festival) {
        return !!(festival.name &&
            festival.culturalMeaning &&
            festival.associatedFoods &&
            festival.associatedFoods.length > 0 &&
            festival.foodSymbolism &&
            festival.emotionalTone);
    }
    validateEmotionFoodMapping(mapping) {
        return !!(mapping.emotion &&
            mapping.recommendedFood &&
            mapping.emotionalLogic &&
            mapping.homeVsStreet);
    }
    // Interface implementation with error handling
    getSlangInfo(term) {
        try {
            if (!this.isLoaded) {
                throw ErrorHandler_1.ErrorHandler.createDatabaseError('slang lookup');
            }
            return this.slangData.get(term.toLowerCase()) || null;
        }
        catch (error) {
            console.error('Error retrieving slang info:', error);
            return null;
        }
    }
    getFoodInfo(city, preferences) {
        try {
            if (!this.isLoaded) {
                throw ErrorHandler_1.ErrorHandler.createDatabaseError('food lookup');
            }
            const cityFoods = this.foodData.get(city.toLowerCase()) || [];
            return cityFoods.filter(food => {
                // Filter by dietary preference
                if (preferences.dietary === 'veg' && food.name.toLowerCase().includes('chicken')) {
                    return false;
                }
                if (preferences.dietary === 'non-veg' && !food.name.toLowerCase().includes('chicken')) {
                    // For this simple implementation, assume non-chicken items are veg
                    // In a real system, we'd have proper dietary classification
                    return food.name.toLowerCase().includes('chicken');
                }
                // Filter by spice level (allow same or lower spice level)
                const spiceLevels = {
                    'low': 1,
                    'medium': 2,
                    'high': 3,
                    'extreme': 4
                };
                const userSpiceLevel = spiceLevels[preferences.spiceLevel];
                const foodSpiceLevel = spiceLevels[food.spiceLevel];
                if (userSpiceLevel < foodSpiceLevel) {
                    return false;
                }
                // Filter by time of day if specified
                if (preferences.timeOfDay) {
                    const timeMapping = {
                        'morning': ['Morning', 'morning'],
                        'afternoon': ['Lunch', 'lunch'],
                        'evening': ['Evening', 'evening', 'Any', 'any'],
                        'night': ['Evening', 'evening', 'Any', 'any']
                    };
                    const validTimes = timeMapping[preferences.timeOfDay.toLowerCase()] || [];
                    const foodBestTime = food.bestTime.toLowerCase();
                    // Check if any valid time matches the food's best time (case-insensitive)
                    if (!validTimes.some(time => foodBestTime.includes(time.toLowerCase()))) {
                        return false;
                    }
                }
                return true;
            });
        }
        catch (error) {
            console.error('Error retrieving food info:', error);
            return [];
        }
    }
    getFestivalInfo(festival) {
        try {
            if (!this.isLoaded) {
                throw ErrorHandler_1.ErrorHandler.createDatabaseError('festival lookup');
            }
            return this.festivalData.get(festival.toLowerCase()) || null;
        }
        catch (error) {
            console.error('Error retrieving festival info:', error);
            return null;
        }
    }
    getEmotionFoodMapping(emotion) {
        try {
            if (!this.isLoaded) {
                throw ErrorHandler_1.ErrorHandler.createDatabaseError('emotion mapping lookup');
            }
            return this.emotionFoodData.get(emotion.toLowerCase()) || null;
        }
        catch (error) {
            console.error('Error retrieving emotion mapping:', error);
            return null;
        }
    }
    // Additional utility methods
    getAllSlangTerms() {
        return Array.from(this.slangData.keys());
    }
    getAllCities() {
        return Array.from(this.foodData.keys());
    }
    getAllFestivals() {
        return Array.from(this.festivalData.keys());
    }
    getAllEmotions() {
        return Array.from(this.emotionFoodData.keys());
    }
    isDataLoaded() {
        return this.isLoaded;
    }
    /**
     * Gets slang info with fallback response for missing data
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getSlangInfoWithFallback(term) {
        const slangInfo = this.getSlangInfo(term);
        if (slangInfo) {
            return slangInfo;
        }
        return ErrorHandler_1.ErrorHandler.createSlangFallback(term);
    }
    /**
     * Gets food info with fallback response for missing data
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getFoodInfoWithFallback(city, preferences) {
        const foodInfo = this.getFoodInfo(city, preferences);
        if (foodInfo.length > 0) {
            return foodInfo;
        }
        return ErrorHandler_1.ErrorHandler.createFoodFallback(city, preferences);
    }
    /**
     * Gets festival info with fallback response for missing data
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getFestivalInfoWithFallback(festival) {
        const festivalInfo = this.getFestivalInfo(festival);
        if (festivalInfo) {
            return festivalInfo;
        }
        return ErrorHandler_1.ErrorHandler.createFestivalFallback(festival);
    }
    /**
     * Gets emotion mapping with fallback response for missing data
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getEmotionFoodMappingWithFallback(emotion) {
        const mapping = this.getEmotionFoodMapping(emotion);
        if (mapping) {
            return mapping;
        }
        return ErrorHandler_1.ErrorHandler.createEmotionFallback(emotion);
    }
}
exports.CulturalDatabaseImpl = CulturalDatabaseImpl;
//# sourceMappingURL=CulturalDatabaseImpl.js.map