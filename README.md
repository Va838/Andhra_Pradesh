# Andhra Local Guide AI

An intelligent cultural assistant that provides authentic, emotionally-aware responses about Andhra Pradesh culture, including local slang, street food, festivals, and emotion-based food recommendations.

## Project Structure

```
src/
├── types/           # TypeScript type definitions and interfaces
├── interfaces/      # Interface definitions for all components
├── components/      # Implementation classes (to be added)
├── data/           # Cultural data and database implementations (to be added)
├── tests/          # Unit tests and property-based tests (to be added)
└── index.ts        # Main entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Architecture

The system follows a layered architecture with clear separation between:
- Dropdown Interface (user input)
- Input Processor (validation and enrichment)
- Response Generation Engine (orchestration)
- Regional Adapter (regional customization)
- Emotion-Food Mapper (emotion-based recommendations)
- Cultural Context Database (data storage)

## Testing

The project uses both unit testing and property-based testing with fast-check library to ensure comprehensive coverage and correctness validation.