"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownInterfaceImpl = void 0;
const ErrorHandler_1 = require("./ErrorHandler");
class DropdownInterfaceImpl {
    constructor() {
        this.categories = ['slang', 'food', 'festival', 'emotion'];
        this.subcategories = {
            slang: [
                'greeting expressions',
                'emotional expressions',
                'casual conversation',
                'family terms',
                'food-related slang'
            ],
            food: [
                'breakfast items',
                'street food',
                'main meals',
                'snacks',
                'beverages',
                'sweets'
            ],
            festival: [
                'Ugadi',
                'Sankranti',
                'Dussehra',
                'Diwali',
                'Vinayaka Chavithi',
                'Shivaratri'
            ],
            emotion: [
                'sad',
                'happy',
                'angry',
                'tired',
                'sick',
                'excited',
                'stressed'
            ]
        };
    }
    getCategories() {
        return [...this.categories];
    }
    getSubcategories(category) {
        try {
            if (!this.isValidCategory(category)) {
                throw new Error(`Invalid category: ${category}. Valid categories are: ${this.categories.join(', ')}`);
            }
            return [...this.subcategories[category]];
        }
        catch (error) {
            console.error('Error getting subcategories:', error);
            throw error;
        }
    }
    processSelection(category, selection, preferences) {
        try {
            // Validate category
            if (!this.isValidCategory(category)) {
                throw new Error(`Invalid category: ${category}. Please select from: ${this.categories.join(', ')}`);
            }
            // Validate selection
            if (!selection || selection.trim() === '') {
                throw new Error('Please provide a selection for your chosen category');
            }
            const validSubcategories = this.subcategories[category];
            if (!validSubcategories.includes(selection)) {
                throw new Error(`"${selection}" is not available for ${category}. Available options: ${validSubcategories.join(', ')}`);
            }
            // Validate preferences if provided
            if (preferences) {
                this.validatePreferences(preferences);
            }
            return {
                category: category,
                selection: selection.trim(),
                preferences: preferences ? { ...preferences } : undefined
            };
        }
        catch (error) {
            console.error('Error processing selection:', error);
            throw error;
        }
    }
    /**
     * Validates selection and returns detailed error information
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for invalid selections
     */
    validateSelection(category, selection, preferences) {
        try {
            this.processSelection(category, selection, preferences);
            return { isValid: true };
        }
        catch (error) {
            const userInput = {
                category: category,
                selection: selection || '',
                preferences
            };
            const culturalError = ErrorHandler_1.ErrorHandler.createInputValidationError(userInput);
            return { isValid: false, error: culturalError };
        }
    }
    /**
     * Gets user-friendly error message for invalid category
     * Requirements: 1.1 - User-friendly error messages
     */
    getCategoryErrorMessage(category) {
        if (!category || category.trim() === '') {
            return 'Please select a category to explore Andhra culture. Choose from slang, food, festival, or emotion.';
        }
        return `"${category}" is not a valid category. Please choose from: ${this.categories.join(', ')}.`;
    }
    /**
     * Gets user-friendly error message for invalid selection
     * Requirements: 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for selections
     */
    getSelectionErrorMessage(category, selection) {
        if (!this.isValidCategory(category)) {
            return this.getCategoryErrorMessage(category);
        }
        if (!selection || selection.trim() === '') {
            return `Please make a selection for ${category}. Available options: ${this.subcategories[category].join(', ')}.`;
        }
        const validOptions = this.subcategories[category];
        return `"${selection}" is not available for ${category}. Try one of these: ${validOptions.join(', ')}.`;
    }
    isValidCategory(category) {
        return this.categories.includes(category);
    }
    validatePreferences(preferences) {
        const validSpiceLevels = ['low', 'medium', 'high', 'extreme'];
        const validDietaryPrefs = ['veg', 'non-veg', 'any'];
        const validFormalityLevels = ['formal', 'informal'];
        const validRegions = ['coastal', 'guntur', 'rayalaseema'];
        if (preferences.spiceLevel && !validSpiceLevels.includes(preferences.spiceLevel)) {
            throw new Error(`Invalid spice level: "${preferences.spiceLevel}". Please choose from: ${validSpiceLevels.join(', ')}`);
        }
        if (preferences.dietary && !validDietaryPrefs.includes(preferences.dietary)) {
            throw new Error(`Invalid dietary preference: "${preferences.dietary}". Please choose from: ${validDietaryPrefs.join(', ')}`);
        }
        if (preferences.formality && !validFormalityLevels.includes(preferences.formality)) {
            throw new Error(`Invalid formality level: "${preferences.formality}". Please choose from: ${validFormalityLevels.join(', ')}`);
        }
        if (preferences.region && !validRegions.includes(preferences.region)) {
            throw new Error(`Invalid region: "${preferences.region}". Please choose from: ${validRegions.join(', ')}`);
        }
    }
    /**
     * Gets user-friendly error message for invalid preferences
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for preferences
     */
    getPreferencesErrorMessage(preferences) {
        const errors = [];
        const validSpiceLevels = ['low', 'medium', 'high', 'extreme'];
        const validDietaryPrefs = ['veg', 'non-veg', 'any'];
        const validFormalityLevels = ['formal', 'informal'];
        const validRegions = ['coastal', 'guntur', 'rayalaseema'];
        if (preferences.spiceLevel && !validSpiceLevels.includes(preferences.spiceLevel)) {
            errors.push(`Spice level "${preferences.spiceLevel}" is not valid. Choose from: ${validSpiceLevels.join(', ')}`);
        }
        if (preferences.dietary && !validDietaryPrefs.includes(preferences.dietary)) {
            errors.push(`Dietary preference "${preferences.dietary}" is not valid. Choose from: ${validDietaryPrefs.join(', ')}`);
        }
        if (preferences.formality && !validFormalityLevels.includes(preferences.formality)) {
            errors.push(`Formality level "${preferences.formality}" is not valid. Choose from: ${validFormalityLevels.join(', ')}`);
        }
        if (preferences.region && !validRegions.includes(preferences.region)) {
            errors.push(`Region "${preferences.region}" is not valid. Choose from: ${validRegions.join(', ')}`);
        }
        return errors;
    }
}
exports.DropdownInterfaceImpl = DropdownInterfaceImpl;
//# sourceMappingURL=DropdownInterfaceImpl.js.map