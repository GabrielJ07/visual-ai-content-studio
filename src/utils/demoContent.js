/**
 * Demo Content Generation Utilities
 *
 * This module provides functions to simulate content generation for the demo page.
 */

/**
 * Simulates generating content for the demo.
 * @returns {Promise<object>} A promise that resolves with the generated content.
 */
export const generateDemoContent = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        image: 'https://placehold.co/600x400/ff7f50/white?text=Demo+Visual',
        text: 'This is a demo of a generated visual based on predetermined archetypes.',
      });
    }, 1500);
  });
};
