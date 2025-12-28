import express from 'express';
import cors from 'cors';
import { AndhraCulturalGuide } from './AndhraCulturalGuide';

const app = express();
const port = process.env.PORT || 3000;

// Initialize the cultural guide
const guide = new AndhraCulturalGuide();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Andhra Local Guide API' });
});

// Get available categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = guide.getCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get subcategories for a category
app.get('/api/categories/:category/subcategories', async (req, res) => {
  try {
    const { category } = req.params;
    const subcategories = guide.getSubcategories(category);
    res.json({ subcategories });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get cultural guidance
app.post('/api/guidance', async (req, res) => {
  try {
    const { category, selection, preferences } = req.body;
    
    if (!category || !selection) {
      return res.status(400).json({ 
        error: 'Category and selection are required' 
      });
    }

    const result = await guide.getCulturalGuidance(category, selection, preferences);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ 
      response: result.response,
      category,
      selection,
      preferences: preferences || {}
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cultural guidance' });
  }
});

// Validate selection
app.post('/api/validate', async (req, res) => {
  try {
    const { category, selection, preferences } = req.body;
    const validation = guide.validateSelection(category, selection, preferences);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate selection' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Andhra Local Guide API running on port ${port}`);
  console.log(`📖 API Documentation:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api/categories - Get available categories`);
  console.log(`   GET  /api/categories/:category/subcategories - Get subcategories`);
  console.log(`   POST /api/guidance - Get cultural guidance`);
  console.log(`   POST /api/validate - Validate selection`);
});

export default app;