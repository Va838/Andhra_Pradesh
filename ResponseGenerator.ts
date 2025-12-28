import { UserIntent, CulturalResponse } from '../types';

export interface ResponseGenerator {
  generateResponse(intent: UserIntent): CulturalResponse;
  applyRegionalContext(response: CulturalResponse, region?: string): CulturalResponse;
  formatOutput(response: CulturalResponse): string;
}