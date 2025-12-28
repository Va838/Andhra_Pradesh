import { UserPreferences, Category } from './types';
/**
 * Main application class that orchestrates all components for Andhra cultural guidance
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Dropdown-based cultural queries
 */
export declare class AndhraCulturalGuide {
    private dropdownInterface;
    private inputProcessor;
    private responseGenerator;
    private responseFormatter;
    private culturalDatabase;
    constructor();
    /**
     * Gets available categories for dropdown selection
     * Requirements: 1.1 - Category selection triggers appropriate subcategories
     */
    getCategories(): string[];
    /**
     * Gets subcategories for a selected category
     * Requirements: 1.1 - Category selection triggers appropriate subcategories
     */
    getSubcategories(category: string): string[];
    /**
     * Validates user selection and preferences
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Input validation with user-friendly errors
     */
    validateSelection(category: string, selection: string, preferences?: UserPreferences): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Main method to get cultural guidance based on user selection
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Complete dropdown-based cultural queries
     * Requirements: 2.2, 2.3, 2.5 - Cultural tone, Telugu words, Andhra-specific content
     */
    getCulturalGuidance(category: string, selection: string, preferences?: UserPreferences): Promise<{
        response: string;
        error?: string;
    }>;
    /**
     * Gets detailed information about available options for a category
     * Requirements: 1.1 - User-friendly interface for category exploration
     */
    getCategoryInfo(category: string): {
        subcategories: string[];
        description: string;
        availablePreferences: string[];
    };
    /**
     * Gets user-friendly error messages for common issues
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - User-friendly error messages
     */
    getErrorMessage(category: string, selection: string, preferences?: UserPreferences): string;
    /**
     * Provides suggestions for similar or related cultural topics
     * Requirements: 8.2 - Fallback logic for non-existent cultural information
     */
    getSuggestions(category: string, failedSelection?: string): string[];
    /**
     * Checks if the cultural database is properly loaded
     * Requirements: 8.1, 8.3 - System validation and data integrity
     */
    isReady(): boolean;
    /**
     * Validates response quality and format
     * Requirements: 2.2, 2.3, 2.5 - Response quality validation
     */
    validateResponseQuality(response: string): {
        isValid: boolean;
        issues: string[];
        suggestions: string[];
    };
    /**
     * Formats a custom response with cultural tone
     * Requirements: 2.2, 2.3, 2.5 - Custom response formatting
     */
    formatCustomResponse(content: string, category: Category, region?: string): string;
    /**
     * Gets system status and health information
     * Requirements: 8.2 - System monitoring and error handling
     */
    getSystemStatus(): {
        isReady: boolean;
        components: Record<string, boolean>;
        lastError?: string;
    };
    /**
     * Generates user-friendly error messages
     * Requirements: 8.2 - Graceful error handling
     */
    private generateUserFriendlyError;
}
//# sourceMappingURL=AndhraCulturalGuide.d.ts.map