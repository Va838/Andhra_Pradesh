import { UserInput, Region } from '../types';

export interface RegionalAdapter {
  detectRegion(input: UserInput): Region;
  adaptTone(content: string, region: Region): string;
  getRegionalSpecialties(category: string, region: Region): string[];
}