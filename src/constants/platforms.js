/**
 * Social Media Platform Configurations
 *
 * This file contains the configuration data for all supported social media platforms,
 * including their names, aspect ratios, and associated use cases. This data is used
 * throughout the application to generate previews and optimize content for each platform.
 */

export const SOCIAL_PLATFORMS = [
  {
    name: 'Instagram Story',
    ratio: '9:16',
    icon: '📸',
    platforms: ['Instagram', 'Snapchat', 'TikTok'],
    thumbnailRatio: 9 / 16,
  },
  {
    name: 'Instagram Post',
    ratio: '1:1',
    icon: '🖼️',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    thumbnailRatio: 1,
  },
  {
    name: 'Facebook Ad',
    ratio: '4:5',
    icon: '📢',
    platforms: ['Facebook', 'Instagram Ads'],
    thumbnailRatio: 4 / 5,
  },
  {
    name: 'YouTube Thumbnail',
    ratio: '16:9',
    icon: '📺',
    platforms: ['YouTube', 'Reddit', 'X/Twitter'],
    thumbnailRatio: 16 / 9,
  },
  {
    name: 'Pinterest Pin',
    ratio: '2:3',
    icon: '📌',
    platforms: ['Pinterest'],
    thumbnailRatio: 2 / 3,
  },
  {
    name: 'X/Twitter Card',
    ratio: '1.91:1',
    icon: '🐦',
    platforms: ['X/Twitter', 'LinkedIn', 'Facebook'],
    thumbnailRatio: 1.91 / 1,
  },
  {
    name: 'TikTok Vertical',
    ratio: '9:16',
    icon: '🎵',
    platforms: ['TikTok', 'Snapchat'],
    thumbnailRatio: 9 / 16,
  },
  {
    name: 'Reddit Image',
    ratio: '4:3',
    icon: '👽',
    platforms: ['Reddit'],
    thumbnailRatio: 4 / 3,
  },
];