import React from 'react';
import { NavLink } from 'react-router-dom';
import { SOCIAL_PLATFORMS } from '../constants/platforms';

const PreviewPage = ({ generatedImage, altText }) => {
  if (!generatedImage) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Nothing to Preview Yet</h2>
        <p className="text-gray-600 mb-6">
          Please generate a visual in the Studio first to see your multi-platform previews here.
        </p>
        <NavLink
          to="/"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Studio
        </NavLink>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Multi-Platform Preview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {SOCIAL_PLATFORMS.map((platform) => (
          <div key={platform.name} className="bg-white p-4 rounded-lg shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">{platform.name} {platform.icon}</h3>
            <p className="text-sm text-gray-500 mb-3">Ratio: {platform.ratio}</p>
            <div
              className="w-full bg-gray-200 rounded-md overflow-hidden"
              style={{ aspectRatio: platform.thumbnailRatio }}
            >
              <img
                src={generatedImage}
                alt={altText || `Preview for ${platform.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewPage;