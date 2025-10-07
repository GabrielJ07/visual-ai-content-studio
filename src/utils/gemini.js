/**
 * Google Gemini AI Utilities
 *
 * This module provides helper functions to interact with the Google Gemini API
 * for text and image generation, prompt refinement, and other AI-powered features.
 */

import { getGeminiConfig } from './config.js';

const { apiKey, textModel, imageModel, baseUrl } = getGeminiConfig();

/**
 * Makes a request to the Gemini API.
 * @param {string} model - The model to use (e.g., 'gemini-2.5-flash-preview-05-20').
 * @param {object} body - The request body.
 * @returns {Promise<object>} The API response data.
 */
const makeGeminiRequest = async (model, body) => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set REACT_APP_GEMINI_API_KEY.');
  }

  const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error?.message || 'An unknown error occurred with the Gemini API.';
    throw new Error(`Gemini API Error: ${errorMessage}`);
  }

  return response.json();
};

/**
 * Refines a user prompt using brand guidelines.
 * @param {string} basePrompt - The user's initial prompt.
 * @param {object} brandKit - The user's brand kit settings.
 * @returns {Promise<string>} The refined, AI-enhanced prompt.
 */
export const refinePrompt = async (basePrompt, brandKit) => {
  const systemPrompt = `
    You are an expert prompt engineer for an AI image generator.
    Your task is to refine a user's base prompt using their brand kit to create a detailed, effective image generation prompt.

    **Brand Kit:**
    - Colors: ${brandKit.colors.join(', ') || 'Not specified'}
    - Typography Mood: ${brandKit.typography || 'Not specified'}
    - Style Keywords: ${brandKit.styleKeywords || 'Not specified'}
    - Campaign Context: ${brandKit.campaignVariable || 'Not specified'}

    **Instructions:**
    1. Analyze the user's base prompt: "${basePrompt}".
    2. Weave in the brand kit elements naturally. The final image should reflect the brand's mood and style.
    3. Enhance the prompt with vivid details, considering composition, lighting, and subject matter.
    4. The output must be ONLY the refined prompt text, ready for the image model. Do not include any other explanatory text.
  `;

  const requestBody = {
    contents: [{
      parts: [{ text: systemPrompt }],
    }],
  };

  const data = await makeGeminiRequest(textModel, requestBody);
  return data.candidates[0].content.parts[0].text.trim();
};

/**
 * Generates an image using the Gemini image model.
 * @param {string} prompt - The detailed prompt for image generation.
 * @returns {Promise<string>} The base64-encoded image data.
 */
export const generateImage = async (prompt) => {
  const requestBody = {
    contents: [{
      parts: [{ text: prompt }],
    }],
  };

  const data = await makeGeminiRequest(imageModel, requestBody);
  return data.candidates[0].content.parts[0].fileData.fileUri;
};

/**
 * Generates alt text for an image.
 * @param {string} imageBase64 - The base64-encoded image data.
 * @returns {Promise<string>} The generated alt text.
 */
export const generateAltText = async (imageBase64) => {
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: "Describe this image for accessibility (alt text). Be concise and accurate." },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: imageBase64
                        }
                    }
                ]
            }
        ]
    };

    const data = await makeGeminiRequest(textModel, requestBody);
    return data.candidates[0].content.parts[0].text.trim();
};