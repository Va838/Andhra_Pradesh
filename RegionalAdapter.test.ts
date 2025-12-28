import { describe, it, expect, beforeEach } from 'vitest';
import { RegionalAdapterImpl } from './RegionalAdapterImpl';
import { UserInput, Region } from '../types';

describe('RegionalAdapter Unit Tests', () => {
  let regionalAdapter: RegionalAdapterImpl;

  beforeEach(() => {
    regionalAdapter = new RegionalAdapterImpl();
  });

  describe('detectRegion', () => {
    it('should detect region from user preferences', () => {
      const input: UserInput = {
        category: 'food',
        selection: 'biryani',
        preferences: {
          region: 'guntur'
        }
      };

      const detectedRegion = regionalAdapter.detectRegion(input);
      expect(detectedRegion).toBe('guntur');
    });

    it('should default to coastal when no region preference is provided', () => {
      const input: UserInput = {
        category: 'slang',
        selection: 'greeting'
      };

      const detectedRegion = regionalAdapter.detectRegion(input);
      expect(detectedRegion).toBe('coastal');
    });

    it('should default to coastal when preferences exist but no region specified', () => {
      const input: UserInput = {
        category: 'food',
        selection: 'curry',
        preferences: {
          spiceLevel: 'high',
          dietary: 'non-veg'
        }
      };

      const detectedRegion = regionalAdapter.detectRegion(input);
      expect(detectedRegion).toBe('coastal');
    });

    it('should handle all valid regions', () => {
      const regions: Region[] = ['coastal', 'guntur', 'rayalaseema'];
      
      regions.forEach(region => {
        const input: UserInput = {
          category: 'festival',
          selection: 'ugadi',
          preferences: { region }
        };

        const detectedRegion = regionalAdapter.detectRegion(input);
        expect(detectedRegion).toBe(region);
      });
    });
  });

  describe('adaptTone - Coastal Region', () => {
    it('should apply coastal tone with gentle expressions', () => {
      const baseContent = 'This is a test message';
      const adaptedContent = regionalAdapter.adaptTone(baseContent, 'coastal');
      
      expect(typeof adaptedContent).toBe('string');
      expect(adaptedContent.length).toBeGreaterThan(0);
      
      // Content should either be unchanged or have coastal markers
      const hasCoastalMarkers = adaptedContent.includes('Babu') || 
                               adaptedContent.includes('Amma') || 
                               adaptedContent.includes('kada') ||
                               adaptedContent.includes('le') ||
                               adaptedContent.includes('Chala bagundi');
      
      expect(adaptedContent === baseContent || hasCoastalMarkers).toBe(true);
    });

    it('should preserve original content structure', () => {
      const baseContent = 'Simple test content';
      const adaptedContent = regionalAdapter.adaptTone(baseContent, 'coastal');
      
      // Should contain the original content
      expect(adaptedContent).toContain('test content');
    });
  });

  describe('adaptTone - Guntur Region', () => {
    it('should apply guntur tone with bold expressions', () => {
      const baseContent = 'This is a test message';
      const adaptedContent = regionalAdapter.adaptTone(baseContent, 'guntur');
      
      expect(typeof adaptedContent).toBe('string');
      expect(adaptedContent.length).toBeGreaterThan(0);
      
      // Content should either be unchanged or have guntur markers
      const hasGunturMarkers = adaptedContent.includes('Rey') || 
                              adaptedContent.includes('Mama') || 
                              adaptedContent.includes('Pakka guarantee') ||
                              adaptedContent.includes('abba') ||
                              adaptedContent.includes('Super spicy');
      
      expect(adaptedContent === baseContent || hasGunturMarkers).toBe(true);
    });
  });

  describe('adaptTone - Rayalaseema Region', () => {
    it('should apply rayalaseema tone with rustic expressions', () => {
      const baseContent = 'This is a test message';
      const adaptedContent = regionalAdapter.adaptTone(baseContent, 'rayalaseema');
      
      expect(typeof adaptedContent).toBe('string');
      expect(adaptedContent.length).toBeGreaterThan(0);
      
      // Content should either be unchanged or have rayalaseema markers
      const hasRayalaseemaMarkers = adaptedContent.includes('Anna') || 
                                   adaptedContent.includes('Ayya') || 
                                   adaptedContent.includes('chelli') ||
                                   adaptedContent.includes('simple ga') ||
                                   adaptedContent.includes('Traditional ga');
      
      expect(adaptedContent === baseContent || hasRayalaseemaMarkers).toBe(true);
    });
  });

  describe('getRegionalSpecialties', () => {
    it('should return coastal food specialties', () => {
      const specialties = regionalAdapter.getRegionalSpecialties('food', 'coastal');
      
      expect(Array.isArray(specialties)).toBe(true);
      expect(specialties.length).toBeGreaterThan(0);
      expect(specialties).toContain('Pulihora');
      expect(specialties).toContain('Gongura Pachadi');
      expect(specialties).toContain('Royyala Curry');
      expect(specialties).toContain('Pesarattu');
    });

    it('should return guntur food specialties', () => {
      const specialties = regionalAdapter.getRegionalSpecialties('food', 'guntur');
      
      expect(Array.isArray(specialties)).toBe(true);
      expect(specialties.length).toBeGreaterThan(0);
      expect(specialties).toContain('Guntur Chicken');
      expect(specialties).toContain('Karam Dosa');
      expect(specialties).toContain('Mirchi Bajji');
      expect(specialties).toContain('Gongura Mutton');
    });

    it('should return rayalaseema food specialties', () => {
      const specialties = regionalAdapter.getRegionalSpecialties('food', 'rayalaseema');
      
      expect(Array.isArray(specialties)).toBe(true);
      expect(specialties.length).toBeGreaterThan(0);
      expect(specialties).toContain('Ragi Sangati');
      expect(specialties).toContain('Natukodi Curry');
      expect(specialties).toContain('Peanut Chutney');
      expect(specialties).toContain('Jowar Roti');
    });

    it('should return regional slang variations', () => {
      const coastalSlang = regionalAdapter.getRegionalSpecialties('slang', 'coastal');
      const gunturSlang = regionalAdapter.getRegionalSpecialties('slang', 'guntur');
      const rayalaseemaSlang = regionalAdapter.getRegionalSpecialties('slang', 'rayalaseema');
      
      expect(coastalSlang).toContain('Babu');
      expect(coastalSlang).toContain('Amma');
      
      expect(gunturSlang).toContain('Rey');
      expect(gunturSlang).toContain('Mama');
      
      expect(rayalaseemaSlang).toContain('Anna');
      expect(rayalaseemaSlang).toContain('Ayya');
    });

    it('should return empty array for unknown category', () => {
      const specialties = regionalAdapter.getRegionalSpecialties('unknown', 'coastal');
      expect(specialties).toEqual([]);
    });
  });

  describe('getRegionalSpicePreference', () => {
    it('should return appropriate spice levels for coastal region', () => {
      const spicePrefs = regionalAdapter.getRegionalSpicePreference('coastal');
      
      expect(Array.isArray(spicePrefs)).toBe(true);
      expect(spicePrefs.length).toBeGreaterThan(0);
      expect(spicePrefs).toContain('medium');
      expect(spicePrefs).toContain('high');
    });

    it('should return high spice levels for guntur region', () => {
      const spicePrefs = regionalAdapter.getRegionalSpicePreference('guntur');
      
      expect(Array.isArray(spicePrefs)).toBe(true);
      expect(spicePrefs).toContain('high');
      expect(spicePrefs).toContain('extreme');
    });

    it('should return moderate spice levels for rayalaseema region', () => {
      const spicePrefs = regionalAdapter.getRegionalSpicePreference('rayalaseema');
      
      expect(Array.isArray(spicePrefs)).toBe(true);
      expect(spicePrefs).toContain('medium');
      expect(spicePrefs).toContain('high');
    });
  });

  describe('getRegionalSlangVariations', () => {
    it('should return coastal slang variations', () => {
      const slangVariations = regionalAdapter.getRegionalSlangVariations('greeting', 'coastal');
      
      expect(Array.isArray(slangVariations)).toBe(true);
      expect(slangVariations.length).toBeGreaterThan(0);
      expect(slangVariations).toContain('Babu');
      expect(slangVariations).toContain('Amma');
      expect(slangVariations).toContain('Chinnodu');
    });

    it('should return guntur slang variations', () => {
      const slangVariations = regionalAdapter.getRegionalSlangVariations('greeting', 'guntur');
      
      expect(Array.isArray(slangVariations)).toBe(true);
      expect(slangVariations.length).toBeGreaterThan(0);
      expect(slangVariations).toContain('Rey');
      expect(slangVariations).toContain('Mama');
      expect(slangVariations).toContain('Abba');
    });

    it('should return rayalaseema slang variations', () => {
      const slangVariations = regionalAdapter.getRegionalSlangVariations('greeting', 'rayalaseema');
      
      expect(Array.isArray(slangVariations)).toBe(true);
      expect(slangVariations.length).toBeGreaterThan(0);
      expect(slangVariations).toContain('Anna');
      expect(slangVariations).toContain('Ayya');
      expect(slangVariations).toContain('Chelli');
    });
  });

  describe('getRegionalFoodPreferences', () => {
    it('should return detailed coastal food preferences', () => {
      const preferences = regionalAdapter.getRegionalFoodPreferences('coastal');
      
      expect(preferences).toBeDefined();
      expect(preferences.preferredSpiceLevel).toContain('medium');
      expect(preferences.preferredSpiceLevel).toContain('high');
      expect(preferences.specialtyDishes).toContain('Pulihora');
      expect(preferences.preferredTiming.breakfast).toContain('Pesarattu');
      expect(preferences.cookingStyle).toContain('coconut-based');
    });

    it('should return detailed guntur food preferences', () => {
      const preferences = regionalAdapter.getRegionalFoodPreferences('guntur');
      
      expect(preferences).toBeDefined();
      expect(preferences.preferredSpiceLevel).toContain('high');
      expect(preferences.preferredSpiceLevel).toContain('extreme');
      expect(preferences.specialtyDishes).toContain('Guntur Chicken');
      expect(preferences.preferredTiming.breakfast).toContain('Karam Dosa');
      expect(preferences.cookingStyle).toContain('extra-spicy');
    });

    it('should return detailed rayalaseema food preferences', () => {
      const preferences = regionalAdapter.getRegionalFoodPreferences('rayalaseema');
      
      expect(preferences).toBeDefined();
      expect(preferences.preferredSpiceLevel).toContain('medium');
      expect(preferences.specialtyDishes).toContain('Ragi Sangati');
      expect(preferences.preferredTiming.breakfast).toContain('Ragi Sangati');
      expect(preferences.cookingStyle).toContain('traditional');
    });
  });

  describe('getDetailedRegionalSlang', () => {
    it('should return detailed coastal slang data', () => {
      const slangData = regionalAdapter.getDetailedRegionalSlang('coastal');
      
      expect(slangData).toBeDefined();
      expect(slangData.greetings).toContain('Babu');
      expect(slangData.expressions).toContain('Chala bagundi');
      expect(slangData.relationships).toContain('Pedda');
      expect(slangData.usage['Babu']).toBeDefined();
    });

    it('should return detailed guntur slang data', () => {
      const slangData = regionalAdapter.getDetailedRegionalSlang('guntur');
      
      expect(slangData).toBeDefined();
      expect(slangData.greetings).toContain('Rey');
      expect(slangData.expressions).toContain('Pakka guarantee');
      expect(slangData.relationships).toContain('Boss');
      expect(slangData.usage['Rey']).toBeDefined();
    });

    it('should return detailed rayalaseema slang data', () => {
      const slangData = regionalAdapter.getDetailedRegionalSlang('rayalaseema');
      
      expect(slangData).toBeDefined();
      expect(slangData.greetings).toContain('Anna');
      expect(slangData.expressions).toContain('Simple ga');
      expect(slangData.relationships).toContain('Tammudu');
      expect(slangData.usage['Anna']).toBeDefined();
    });
  });

  describe('getRegionalCulturalContext', () => {
    it('should return coastal cultural context', () => {
      const context = regionalAdapter.getRegionalCulturalContext('coastal');
      
      expect(context).toBeDefined();
      expect(context.tone).toBe('gentle and soft');
      expect(context.characteristics).toContain('hospitable');
      expect(context.values).toContain('respect for elders');
    });

    it('should return guntur cultural context', () => {
      const context = regionalAdapter.getRegionalCulturalContext('guntur');
      
      expect(context).toBeDefined();
      expect(context.tone).toBe('bold and direct');
      expect(context.characteristics).toContain('spice-loving');
      expect(context.values).toContain('honesty');
    });

    it('should return rayalaseema cultural context', () => {
      const context = regionalAdapter.getRegionalCulturalContext('rayalaseema');
      
      expect(context).toBeDefined();
      expect(context.tone).toBe('rustic and traditional');
      expect(context.characteristics).toContain('agriculture-focused');
      expect(context.values).toContain('simplicity');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle empty content in tone adaptation', () => {
      const emptyContent = '';
      const adaptedContent = regionalAdapter.adaptTone(emptyContent, 'coastal');
      
      expect(typeof adaptedContent).toBe('string');
    });

    it('should handle very long content in tone adaptation', () => {
      const longContent = 'This is a very long content '.repeat(100);
      const adaptedContent = regionalAdapter.adaptTone(longContent, 'guntur');
      
      expect(typeof adaptedContent).toBe('string');
      expect(adaptedContent.length).toBeGreaterThan(0);
    });

    it('should handle input without preferences gracefully', () => {
      const input: UserInput = {
        category: 'emotion',
        selection: 'happy'
      };

      const detectedRegion = regionalAdapter.detectRegion(input);
      expect(detectedRegion).toBe('coastal');
    });

    it('should handle null preferences gracefully', () => {
      const input: UserInput = {
        category: 'festival',
        selection: 'ugadi',
        preferences: undefined
      };

      const detectedRegion = regionalAdapter.detectRegion(input);
      expect(detectedRegion).toBe('coastal');
    });
  });
});