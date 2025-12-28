import { UserInput, EnrichedInput, UserIntent } from '../types';
export interface InputProcessor {
    validateInput(input: UserInput): boolean;
    enrichInput(input: UserInput): EnrichedInput;
    inferIntent(input: EnrichedInput): UserIntent;
}
//# sourceMappingURL=InputProcessor.d.ts.map