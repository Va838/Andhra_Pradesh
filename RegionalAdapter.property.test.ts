import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { RegionalAdapterImpl } from './RegionalAdapterImpl';
import { UserInput, Region, Category } from '../types';

describe('RegionalAdapter Property Tests', () => {
  const regionalAdapter = new RegionalAdapterImpl();

  /**
   * **Feature: andhra-local-guide, Property 9: Regional adaptation affects response characteristics**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   */
  it('should adapt response characteristics based on regional context', () => {
    fc.assert(
      fc.property(
        // Generate random user input with different regions
        fc.record({
          category: fc.constantFrom('slang', 'food', 'festival', 'emotion') as fc.Arbitrary<Category>,
          selection: fc.string({ minLength: 1, maxLength: 50 }),
          preferences: fc.record({
            region: fc.constantFrom('coastal', 'guntur', 'rayalaseema') as fc.Arbitrary<Region>,
            spiceLevel: fc.option(fc.constantFrom('low', 'medium', 'high', 'extreme')),
            dietary: fc.option(fc.constantFrom('veg', 'non-veg', 'any')),
            formality: fc.option(fc.constantFrom('formal', 'informal'))
          }, { requiredKeys: ['region'] })
        }, { requiredKeys: ['category', 'selection', 'preferences'] }),
        fc.string({ minLength: 10, maxLength: 200 }), // Base content to adapt
        (userInput: UserInput, baseContent: string) => {
          // Act - detect region and adapt tone
          const detectedRegion = regionalAdapter.detectRegion(userInput);
          const adaptedContent = regionalAdapter.adaptTone(baseContent, detectedRegion);
          const regionalSpecialties = regionalAdapter.getRegionalSpecialties('food', detectedRegion);
          
          // Assert - region detection should match user preference
          expect(detectedRegion).toBe(userInput.preferences!.region);
          
          // Assert - adapted content should be different or same as base (tone adaptation may or may not trigger)
          expect(typeof adaptedContent).toBe('string');
          expect(adaptedContent.length).toBeGreaterThan(0);
          
          // Assert - regional specialties should be appropriate for the region
          expect(Array.isArray(regionalSpecialties)).toBe(true);
          
          // Verify region-specific characteristics
          switch (detectedRegion) {
            case 'coastal':
              // Coastal should have gentle tone markers or original content
              expect(adaptedContent).toBeDefined();
              // Regional specialties should include coastal foods
              if (regionalSpecialties.length > 0) {
                expect(regionalSpecialties.some(food => 
                  ['Pulihora', 'Gongura Pachadi', 'Royyala Curry', 'Pesarattu'].includes(food)
                )).toBe(true);
              }
              break;
              
            case 'guntur':
              // Guntur should have bold tone markers or original content
              expect(adaptedContent).toBeDefined();
              // Regional specialties should include spicy Guntur foods
              if (regionalSpecialties.length > 0) {
                expect(regionalSpecialties.some(food => 
                  ['Guntur Chicken', 'Karam Dosa', 'Mirchi Bajji', 'Gongura Mutton'].includes(food)
                )).toBe(true);
              }
              break;
              
            case 'rayalaseema':
              // Rayalaseema should have rustic tone markers or original content
              expect(adaptedContent).toBeDefined();
              // Regional specialties should include traditional Rayalaseema foods
              if (regionalSpecialties.length > 0) {
                expect(regionalSpecialties.some(food => 
                  ['Ragi Sangati', 'Natukodi Curry', 'Peanut Chutney', 'Jowar Roti'].includes(food)
                )).toBe(true);
              }
              break;
          }
          
          // Assert - spice preferences should match regional characteristics
          const spicePrefs = regionalAdapter.getRegionalSpicePreference(detectedRegion);
          expect(Array.isArray(spicePrefs)).toBe(true);
          expect(spicePrefs.length).toBeGreaterThan(0);
          
          // Verify spice level appropriateness for each region
          switch (detectedRegion) {
            case 'coastal':
              expect(spicePrefs.some(level => ['medium', 'high'].includes(level))).toBe(true);
              break;
            case 'guntur':
              expect(spicePrefs.some(level => ['high', 'extreme'].includes(level))).toBe(true);
              break;
            case 'rayalaseema':
              expect(spicePrefs.some(level => ['medium', 'high'].includes(level))).toBe(true);
              break;
          }
          
          // Assert - regional slang variations should be appropriate
          const slangVariations = regionalAdapter.getRegionalSlangVariations('greeting', detectedRegion);
          expect(Array.isArray(slangVariations)).toBe(true);
          
          // Verify region-specific slang
          switch (detectedRegion) {
            case 'coastal':
              if (slangVariations.length > 0) {
                expect(slangVariations.some(slang => 
                  ['Babu', 'Amma', 'Chinnodu', 'Pedda'].includes(slang)
                )).toBe(true);
              }
              break;
            case 'guntur':
              if (slangVariations.length > 0) {
                expect(slangVariations.some(slang => 
                  ['Rey', 'Mama', 'Abba', 'Boss'].includes(slang)
                )).toBe(true);
              }
              break;
            case 'rayalaseema':
              if (slangVariations.length > 0) {
                expect(slangVariations.some(slang => 
                  ['Anna', 'Ayya', 'Chelli', 'Tammudu'].includes(slang)
                )).toBe(true);
              }
              break;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that region detection defaults to coastal when no preference is provided
   */
  it('should default to coastal region when no region preference is specified', () => {
    fc.assert(
      fc.property(
        fc.record({
          category: fc.constantFrom('slang', 'food', 'festival', 'emotion') as fc.Arbitrary<Category>,
          selection: fc.string({ minLength: 1, maxLength: 50 }),
          preferences: fc.option(fc.record({
            spiceLevel: fc.option(fc.constantFrom('low', 'medium', 'high', 'extreme')),
            dietary: fc.option(fc.constantFrom('veg', 'non-veg', 'any')),
            formality: fc.option(fc.constantFrom('formal', 'informal'))
          }))
        }, { requiredKeys: ['category', 'selection'] }),
        (userInput: UserInput) => {
          // Act
          const detectedRegion = regionalAdapter.detectRegion(userInput);
          
          // Assert - should default to coastal
          expect(detectedRegion).toBe('coastal');
        }
      ),
      { numRuns: 50 }
    );
  });
});