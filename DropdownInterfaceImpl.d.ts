import { DropdownInterface } from '../interfaces/DropdownInterface';
import { UserInput, UserPreferences, CulturalError } from '../types';
export declare class DropdownInterfaceImpl implements DropdownInterface {
    private readonly categories;
    private readonly subcategories;
    getCategories(): string[];
    getSubcategories(category: string): string[];
    processSelection(category: string, selection: string, preferences?: UserPreferences): UserInput;
    /**
     * Validates selection and returns detailed error information
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for invalid selections
     */
    validateSelection(category: string, selection: string, preferences?: UserPreferences): {
        isValid: boolean;
        error?: CulturalError;
    };
    /**
     * Gets user-friendly error message for invalid category
     * Requirements: 1.1 - User-friendly error messages
     */
    getCategoryErrorMessage(category: string): string;
    /**
     * Gets user-friendly error message for invalid selection
     * Requirements: 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for selections
     */
    getSelectionErrorMessage(category: string, selection: string): string;
    private isValidCategory;
    private validatePreferences;
    /**
     * Gets user-friendly error message for invalid preferences
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages for preferences
     */
    getPreferencesErrorMessage(preferences: UserPreferences): string[];
}
//# sourceMappingURL=DropdownInterfaceImpl.d.ts.map