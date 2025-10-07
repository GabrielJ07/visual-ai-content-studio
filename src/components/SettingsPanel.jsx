import React, { useState, useEffect, useCallback } from 'react';
import { getAppConfig } from '../utils/config';
import { storage, localStorageFallback } from '../utils/storage';
import { useError } from '../utils/errorContext';

const SettingsPanel = () => {
  const [brandKit, setBrandKit] = useState({
    colors: ['', '', '', '', ''],
    typography: '',
    styleKeywords: '',
    campaignVariable: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showError, showSuccess } = useError();
  const appId = getAppConfig().appId;

  const loadSettings = useCallback(async () => {
    try {
      let config = await storage.loadConfig(appId);
      if (!config) {
        config = localStorageFallback.loadConfig(appId);
      }
      if (config && config.brandKit) {
        // Ensure colors array has 5 elements
        const colors = config.brandKit.colors || [];
        while (colors.length < 5) {
          colors.push('');
        }
        setBrandKit({ ...config.brandKit, colors: colors.slice(0, 5) });
      }
    } catch (error) {
      showError('Failed to load brand settings. Using defaults.');
    } finally {
      setIsLoading(false);
    }
  }, [appId, showError]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleColorChange = (index, value) => {
    const newColors = [...brandKit.colors];
    newColors[index] = value;
    setBrandKit({ ...brandKit, colors: newColors });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrandKit({ ...brandKit, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const configToSave = { brandKit };
      await storage.saveConfig(appId, configToSave);
      // Also save to local storage as a fallback
      localStorageFallback.saveConfig(appId, configToSave);
      showSuccess('Brand Kit saved successfully!');
    } catch (error) {
      showError('Failed to save Brand Kit.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        Brand Kit & User Settings
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Color Palette Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Color Palette</h3>
          <p className="text-sm text-gray-500 mb-4">Define your brand's primary colors. The first 3 are required.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {brandKit.colors.map((color, index) => (
              <div key={index} className="flex flex-col items-center">
                <label htmlFor={`color-${index}`} className="block text-sm font-medium text-gray-600 mb-2">
                  Color {index + 1}
                </label>
                <input
                  type="color"
                  id={`color-${index}`}
                  value={color || '#ffffff'}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-20 h-20 rounded-full border-2 border-gray-300 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Typography & Style Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Typography</h3>
            <label htmlFor="typography" className="block text-sm font-medium text-gray-600 mb-2">
              Describe the mood and style of your typography (e.g., "Bold, modern, sans-serif").
            </label>
            <input
              type="text"
              id="typography"
              name="typography"
              value={brandKit.typography}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Elegant, serif, professional"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Style Keywords</h3>
            <label htmlFor="styleKeywords" className="block text-sm font-medium text-gray-600 mb-2">
              Keywords to guide AI image generation (comma-separated).
            </label>
            <input
              type="text"
              id="styleKeywords"
              name="styleKeywords"
              value={brandKit.styleKeywords}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Minimalist, Cinematic, Vibrant"
            />
          </div>
        </div>

        {/* Campaign Variable Section */}
        <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Campaign Variable</h3>
            <label htmlFor="campaignVariable" className="block text-sm font-medium text-gray-600 mb-2">
              Temporary, campaign-specific directives (e.g., "Holiday promotion," "Product launch").
            </label>
            <input
              type="text"
              id="campaignVariable"
              name="campaignVariable"
              value={brandKit.campaignVariable}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Summer Sale 2024"
            />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Brand Kit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;