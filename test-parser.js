// Simple test to verify product.md parsing
const { ProductMdParser } = require('./dist/data/ProductMdParser.js');

try {
  const parser = new ProductMdParser('product.md');
  const result = parser.parseProductMd();
  
  console.log('Parsing Results:');
  console.log('Slang items:', result.slang.length);
  console.log('Food items:', result.food.length);
  console.log('Festival items:', result.festivals.length);
  console.log('Emotion mappings:', result.emotions.length);
  
  if (result.slang.length > 0) {
    console.log('\nFirst slang item:', result.slang[0]);
  }
  
  if (result.food.length > 0) {
    console.log('\nFirst food item:', result.food[0]);
  }
  
  if (result.festivals.length > 0) {
    console.log('\nFirst festival:', result.festivals[0]);
  }
  
  if (result.emotions.length > 0) {
    console.log('\nFirst emotion mapping:', result.emotions[0]);
  }
  
} catch (error) {
  console.error('Error parsing product.md:', error.message);
}