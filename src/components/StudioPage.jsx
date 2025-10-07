import React, { useState, useEffect, useCallback } from 'react';
import { refinePrompt, generateImage, generateAltText } from '../utils/gemini';
import { getAppConfig } from '../utils/config';
import { storage, localStorageFallback } from '../utils/storage';
import { useError } from '../utils/errorContext';
import { Download, Sparkles, RefreshCw } from 'lucide-react';

const StudioPage = ({ generatedImage, setGeneratedImage, altText, setAltText }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brandKit, setBrandKit] = useState(null);
  const { showError, showSuccess } = useError();
  const appId = getAppConfig().appId;

  const loadBrandKit = useCallback(async () => {
    try {
      let config = await storage.loadConfig(appId);
      if (!config) {
        config = localStorageFallback.loadConfig(appId);
      }
      if (config && config.brandKit) {
        setBrandKit(config.brandKit);
      } else {
        showError("Brand Kit not found. Please configure it in Settings.", "warning");
      }
    } catch (error) {
      showError('Failed to load brand kit.');
    }
  }, [appId, showError]);

  useEffect(() => {
    loadBrandKit();
  }, [loadBrandKit]);

  const handleRefinePrompt = async () => {
    if (!prompt) {
      showError('Please enter a base prompt first.');
      return;
    }
    if (!brandKit) {
      showError('Brand Kit is not loaded. Cannot refine prompt.');
      return;
    }
    setIsLoading(true);
    try {
      const refined = await refinePrompt(prompt, brandKit);
      setPrompt(refined);
      showSuccess('Prompt refined successfully!');
    } catch (error) {
      showError(`Failed to refine prompt: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) {
      showError('Please enter a prompt first.');
      return;
    }
    setIsLoading(true);
    setGeneratedImage(null);
    setAltText('');
    try {
      const imageData = await generateImage(prompt);
      setGeneratedImage(imageData);
      showSuccess('Image generated successfully!');
      // Generate alt text automatically
      const generatedAlt = await generateAltText(imageData.split(',')[1]);
      setAltText(generatedAlt);
    } catch (error) {
      showError(`Failed to generate image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* Left Panel: Inputs & Controls */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Create Your Visual</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Base Prompt
            </label>
            <textarea
              id="prompt"
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., a futuristic cityscape at sunset"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefinePrompt}
              disabled={isLoading || !brandKit}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Refine with Brand AI
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGenerateImage}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-5 h-5 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate Visual'}
          </button>
        </div>
      </div>

      {/* Right Panel: Image Preview */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[400px]">
        {isLoading && !generatedImage && (
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto text-gray-400 animate-spin" />
            <p className="mt-4 text-gray-600">Generating your masterpiece...</p>
          </div>
        )}
        {generatedImage && (
          <div className="w-full">
            <img src={generatedImage} alt={altText || 'AI generated visual'} className="rounded-lg shadow-md w-full object-contain" />
            <div className="mt-4">
              <label htmlFor="altText" className="block text-sm font-medium text-gray-700">
                Alt Text (for accessibility)
              </label>
              <textarea
                id="altText"
                rows="2"
                className="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
              <a
                href={generatedImage}
                download="ai-generated-visual.png"
                className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Image
              </a>
            </div>
          </div>
        )}
        {!isLoading && !generatedImage && (
          <div className="text-center text-gray-500">
            <p>Your generated image will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioPage;