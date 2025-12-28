"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductMdParser = void 0;
const fs = __importStar(require("fs"));
const DataValidator_1 = require("./DataValidator");
class ProductMdParser {
    constructor(productMdPath = 'product.md') {
        this.productMdPath = productMdPath;
    }
    parseProductMd() {
        try {
            const content = fs.readFileSync(this.productMdPath, 'utf-8');
            return this.parseContent(content);
        }
        catch (error) {
            throw new Error(`Failed to read product.md: ${error}`);
        }
    }
    parseContent(content) {
        const sections = this.extractSections(content);
        return {
            slang: this.parseSlangSection(sections.slang || ''),
            food: this.parseFoodSection(sections.food || ''),
            festivals: this.parseFestivalSection(sections.festivals || ''),
            emotions: this.parseEmotionSection(sections.emotions || '')
        };
    }
    extractSections(content) {
        const sections = {};
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
    parseSlangSection(content) {
        const slangItems = [];
        // Extract slang entries using quotes as delimiters
        const slangMatches = content.match(/"([^"]+)"/g);
        if (!slangMatches)
            return slangItems;
        const slangTerms = slangMatches.map(match => match.replace(/"/g, ''));
        for (const term of slangTerms) {
            const slangInfo = this.parseSlangTerm(content, term);
            if (slangInfo && DataValidator_1.DataValidator.validateSlangInfo(slangInfo)) {
                slangItems.push(slangInfo);
            }
        }
        return slangItems;
    }
    parseSlangTerm(content, term) {
        // Find the section for this specific term
        const termRegex = new RegExp(`"${this.escapeRegex(term)}"([\\s\\S]*?)(?="[^"]*"|$)`, 'i');
        const termMatch = content.match(termRegex);
        if (!termMatch)
            return null;
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
    parseFoodSection(content) {
        const foodItems = [];
        // Split content by lines and process
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        let currentCity = '';
        for (const line of lines) {
            // Skip section headers
            if (line.includes('🍗') || line.includes('Food Principles') || line.includes('City-wise')) {
                continue;
            }
            // Check if this is a city header (no arrow, contains city name)
            if (!line.includes('→') && (line.includes('Visakhapatnam') ||
                line.includes('Vijayawada') ||
                line.includes('Guntur') ||
                line.includes('Tirupati'))) {
                currentCity = this.extractCityName(line) || '';
                continue;
            }
            // Check if this is a food item (contains arrow)
            if (line.includes('→') && currentCity) {
                const foodInfo = this.parseFoodLine(line, currentCity);
                if (foodInfo && DataValidator_1.DataValidator.validateFoodInfo(foodInfo)) {
                    foodItems.push(foodInfo);
                }
            }
        }
        return foodItems;
    }
    extractCityName(cityLine) {
        // Handle formats like "Visakhapatnam (Vizag)" or "Guntur"
        const match = cityLine.match(/^([A-Za-z\s]+)(?:\s*\([^)]+\))?/);
        return match ? match[1].trim() : null;
    }
    parseFoodLine(line, city) {
        // Parse lines like "Punugulu → medium spice" or "Idli with Karam → spicy breakfast"
        const parts = line.split('→');
        if (parts.length !== 2)
            return null;
        const name = parts[0].trim();
        const description = parts[1].trim();
        // Extract spice level
        let spiceLevel = 'medium';
        if (description.toLowerCase().includes('extreme'))
            spiceLevel = 'extreme';
        else if (description.toLowerCase().includes('high') || description.toLowerCase().includes('spicy'))
            spiceLevel = 'high';
        else if (description.toLowerCase().includes('low') || description.toLowerCase().includes('mild'))
            spiceLevel = 'low';
        // Extract best time
        let bestTime = 'Evening';
        if (description.toLowerCase().includes('breakfast') || description.toLowerCase().includes('morning'))
            bestTime = 'Morning';
        else if (description.toLowerCase().includes('lunch'))
            bestTime = 'Lunch';
        else if (description.toLowerCase().includes('evening'))
            bestTime = 'Evening';
        return {
            name,
            city,
            spiceLevel,
            bestTime,
            description,
            culturalSignificance: `Traditional ${city} specialty`
        };
    }
    parseFestivalSection(content) {
        const festivals = [];
        // Split content by lines and process
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        let currentFestival = '';
        let festivalData = {};
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
                    const festival = {
                        name: currentFestival,
                        culturalMeaning: festivalData.culturalMeaning,
                        associatedFoods: festivalData.associatedFoods,
                        foodSymbolism: festivalData.foodSymbolism || `Traditional foods representing the spirit of ${currentFestival}`,
                        emotionalTone: festivalData.emotionalTone || 'Celebratory'
                    };
                    if (DataValidator_1.DataValidator.validateFestivalInfo(festival)) {
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
                }
                else if (line.toLowerCase().startsWith('foods:') || line.toLowerCase().startsWith('food:')) {
                    const foodsText = line.replace(/^foods?:\s*/i, '');
                    festivalData.associatedFoods = foodsText.split(',').map(f => f.trim());
                }
                else if (line.toLowerCase().includes('emotional tone:')) {
                    festivalData.emotionalTone = line.replace(/.*emotional tone:\s*/i, '');
                }
                else if (line.toLowerCase().includes('symbolizes') || line.toLowerCase().includes('represents')) {
                    festivalData.foodSymbolism = line;
                }
            }
        }
        // Don't forget the last festival
        if (currentFestival && festivalData.culturalMeaning && festivalData.associatedFoods) {
            const festival = {
                name: currentFestival,
                culturalMeaning: festivalData.culturalMeaning,
                associatedFoods: festivalData.associatedFoods,
                foodSymbolism: festivalData.foodSymbolism || `Traditional foods representing the spirit of ${currentFestival}`,
                emotionalTone: festivalData.emotionalTone || 'Celebratory'
            };
            if (DataValidator_1.DataValidator.validateFestivalInfo(festival)) {
                festivals.push(festival);
            }
        }
        return festivals;
    }
    parseEmotionSection(content) {
        const emotions = [];
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
                if (parts.length !== 2)
                    continue;
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
                let homeVsStreet = 'both';
                const foodLower = recommendedFood.toLowerCase();
                if (foodLower.includes('coffee') || foodLower.includes('punugulu')) {
                    homeVsStreet = 'street';
                }
                else if (foodLower.includes('pappu') || foodLower.includes('rasam') || foodLower.includes('curd rice')) {
                    homeVsStreet = 'home';
                }
                const mapping = {
                    emotion,
                    recommendedFood,
                    emotionalLogic,
                    homeVsStreet
                };
                if (DataValidator_1.DataValidator.validateEmotionFoodMapping(mapping)) {
                    emotions.push(mapping);
                }
            }
        }
        return emotions;
    }
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    validateParsedData(data) {
        return DataValidator_1.DataValidator.validateDataCompleteness(data);
    }
}
exports.ProductMdParser = ProductMdParser;
//# sourceMappingURL=ProductMdParser.js.map