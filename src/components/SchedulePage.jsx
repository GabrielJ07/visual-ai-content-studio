import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SOCIAL_PLATFORMS } from '../constants/platforms';
import { useError } from '../utils/errorContext';
import { Calendar, Clock, Send } from 'lucide-react';

const SchedulePage = ({ generatedImage, altText }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const { showSuccess, showError } = useError();

  if (!generatedImage) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Nothing to Schedule Yet</h2>
        <p className="text-gray-600 mb-6">
          Please generate a visual in the Studio before scheduling a post.
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

  const handlePlatformToggle = (platformName) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformName)
        ? prev.filter((p) => p !== platformName)
        : [...prev, platformName]
    );
  };

  const handleSchedule = () => {
    if (selectedPlatforms.length === 0) {
      showError('Please select at least one platform.');
      return;
    }
    if (!scheduleDate) {
      showError('Please select a date and time for deployment.');
      return;
    }

    setIsScheduling(true);
    // Simulate API call for scheduling
    setTimeout(() => {
      setIsScheduling(false);
      showSuccess(`Content scheduled for ${selectedPlatforms.join(', ')} on ${new Date(scheduleDate).toLocaleString()}`);
      setSelectedPlatforms([]);
      setScheduleDate('');
    }, 1500);
  };

  const today = new Date().toISOString().slice(0, 16);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
      {/* Left Panel: Image Preview */}
      <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Content to Schedule</h3>
        <img src={generatedImage} alt={altText || 'Scheduled content'} className="rounded-lg shadow-md w-full object-contain" />
        <p className="text-sm text-gray-600 mt-2 italic">{altText}</p>
      </div>

      {/* Right Panel: Scheduling Options */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Schedule Deployment</h2>

        {/* Platform Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1. Select Platforms</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => (
              <label key={platform.name} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={selectedPlatforms.includes(platform.name)}
                  onChange={() => handlePlatformToggle(platform.name)}
                />
                <span className="font-medium">{platform.name} {platform.icon}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">2. Set Deployment Time</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={today}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Schedule Button */}
        <button
          onClick={handleSchedule}
          disabled={isScheduling}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        >
          <Send className="w-5 h-5 mr-3" />
          {isScheduling ? 'Scheduling...' : `Schedule Post (${selectedPlatforms.length})`}
        </button>
      </div>
    </div>
  );
};

export default SchedulePage;