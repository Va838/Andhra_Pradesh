import { UserInput, UserPreferences } from '../types';
export interface DropdownInterface {
    getCategories(): string[];
    getSubcategories(category: string): string[];
    processSelection(category: string, selection: string, preferences?: UserPreferences): UserInput;
}
//# sourceMappingURL=DropdownInterface.d.ts.map