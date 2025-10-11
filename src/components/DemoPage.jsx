import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { generateDemoContent } from '../utils/demoContent';

const DemoPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Predetermined archetype file inputs
  const archetypes = {
    persona: 'Adventurous Explorer',
    style: 'Bold and Vibrant',
    tone: 'Inspirational',
  };

  const handleGenerateContent = async () => {
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const content = await generateDemoContent();
      setGeneratedContent(content);
    } catch (error) {
      // In a real app, you'd show an error to the user
      console.error('Failed to generate demo content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Application Demo
        </h1>
        <p className="text-lg text-gray-600">
          This is a simplified demonstration of the content generation capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Panel: Inputs */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Content Parameters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Persona Archetype
              </label>
              <input
                type="text"
                readOnly
                value={archetypes.persona}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Visual Style
              </label>
              <input
                type="text"
                readOnly
                value={archetypes.style}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand Tone
              </label>
              <input
                type="text"
                readOnly
                value={archetypes.tone}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleGenerateContent}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              <RefreshCw className={`w-5 h-5 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        </div>

        {/* Right Panel: Generated Content */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[400px]">
          {isLoading && (
            <div className="text-center">
              <RefreshCw className="w-12 h-12 mx-auto text-gray-400 animate-spin" />
              <p className="mt-4 text-gray-600">Generating content...</p>
            </div>
          )}
          {generatedContent && (
            <div className="w-full text-center">
              <img src={generatedContent.image} alt="Generated visual" className="rounded-lg shadow-md w-full object-contain mb-4" />
              <p className="text-gray-700">{generatedContent.text}</p>
            </div>
          )}
          {!isLoading && !generatedContent && (
            <div className="text-center text-gray-500">
              <p>Generated content will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
