import { GoogleGenerativeAI } from '@google/generative-ai';

export const handleChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if API key is not configured
      return res.status(200).json({ 
        response: "I'm your AI health assistant. Note: Gemini API key is not configured in the backend environment, so I cannot process your request fully. Please ask the administrator to configure it." 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemContext = "You are a professional and compassionate AI health assistant for 'Care Companion Hospital'. Your responses must be accurate, helpful, and maintain a professional medical tone. Always clarify that you provide general health information and are not a substitute for professional medical diagnosis, treatment, or advice. Encourage users to book an appointment with our specialist doctors for serious concerns.";
    const fullPrompt = `Role: ${systemContext}\n\nUser Question: ${prompt}\n\nPlease provide a detailed and professional response.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      return res.status(500).json({ message: "I'm sorry, I couldn't generate a response. Please try a different question." });
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error('Gemini AI Controller Error:', error);
    
    // Extract status code if available
    const statusCode = error.status || error.response?.status || (error.message?.includes('429') ? 429 : error.message?.includes('403') ? 403 : 500);
    
    if (statusCode === 429 || error.message?.includes('quota')) {
      return res.status(429).json({ 
        response: "Limit reached. please do conversation after 12 hours" 
      });
    }

    if (statusCode === 403) {
      return res.status(403).json({ 
        response: "I'm currently unable to access the AI service (Permission Denied). Please contact the administrator to verify the API key and ensure 'Generative Language API' is enabled." 
      });
    }

    res.status(500).json({ 
      message: 'AI Assistant Error: ' + (error.message || 'Failed to generate response'),
      response: "I'm having trouble processing your request right now. Please try again in a moment."
    });
  }
};
