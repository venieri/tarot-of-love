// OpenAI API Configuration
// For local development: Replace 'YOUR_API_KEY_HERE' with your actual OpenAI API key
// For production: Use environment variable VITE_OPENAI_API_KEY
export const OPENAI_API_KEY =
	import.meta.env.VITE_OPENAI_API_KEY || "YOUR_API_KEY_HERE";
