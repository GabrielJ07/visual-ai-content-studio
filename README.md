# Visual AI Content Studio

An AI-powered visual content creation platform for social media with brand kit management, multi-platform preview, and Firebase integration. Generate stunning visuals optimized for Instagram, TikTok, YouTube, LinkedIn, and more.

## Features

### 🎨 Visual AI Studio
- **AI Image Generation**: Generate professional visuals using Google's Gemini 2.5 Flash Image model
- **Prompt Refinement**: AI-powered prompt optimization using brand context and campaign variables
- **Multi-modal Alt Text**: Automatic SEO-optimized alt text generation from images
- **Local Image Upload**: Support for uploading and previewing local images

### 🎯 Brand Kit Management
- **Color Palette**: Define up to 5 brand colors with visual preview
- **Typography**: Set typography context for mood and style
- **Style Keywords**: Custom visual style directives (e.g., "Minimalist", "Cinematic")
- **Argonaut Integration**: Import brand kits from external sources

### 📱 Social Media Optimization
- **9 Platform Presets**: Instagram (Story/Post), Facebook Ad, YouTube Thumbnail, Pinterest Pin, Twitter/X Card, LinkedIn, TikTok, Reddit
- **AI Layout Engine**: Automatically determines optimal text placement for each platform
- **Aspect Ratio Preview**: Real-time preview with correct dimensions
- **Multi-format Export**: Select and schedule content for multiple platforms

### 🤖 AI-Powered Features
1. **Prompt Refiner**: Enhances basic prompts with brand guidelines
2. **CTA Generator**: Creates compelling call-to-action suggestions
3. **Trend Suggester**: Uses Google Search grounding to find current trends
4. **Alt Text Generator**: Generates accessible image descriptions
5. **Layout Optimizer**: AI-determines text positioning per platform

### 📅 Content Scheduling
- **Deployment Timeline**: Schedule content with countdown timers
- **Multi-platform Commit**: Batch schedule across multiple formats
- **Status Tracking**: Monitor pending, scheduled, and committed posts

### 💾 Local Storage System
- **Browser Storage**: All data stored locally for privacy
- **Auto-save Settings**: Persistent user preferences and brand kit
- **Image History**: Track generation history with IndexedDB
- **No Cloud Sync**: Complete privacy - data never leaves your device

## Tech Stack

- **Frontend**: React 18+ with Hooks
- **Styling**: Tailwind CSS (inline utility classes)
- **AI Models**: Google Gemini 2.5 Flash (Text & Image)
- **Storage**: Browser localStorage + IndexedDB (privacy-first)
- **Icons**: Lucide-style SVG components

## Requirements

### Dependencies
```json
{
  "react": "^18.0.0"
}
```

### Environment Variables
The app expects these to be injected at runtime:
- `firebaseconfig`: (Optional) Legacy Firebase configuration - no longer required
- `initialauthtoken`: (Optional) Not used in local storage mode
- `appid`: (Optional) Application identifier for compatibility

### API Keys
- **Gemini API Key**: Required for AI features (provided by Canvas runtime)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install react firebase
```

### 2. Configure Storage (Optional)
All data is stored locally by default. No external configuration required.
- Settings: Browser localStorage
- Images: Browser IndexedDB
- Privacy: Data never leaves your device

### 3. Set Environment Variables

**Option A: Using .env file (Recommended for Development)**
```bash
# Copy the example file and fill in your values
cp .env.example .env
```

Edit `.env` with your actual API keys and configuration values. See `.env.example` for all available options.

**Option B: Runtime Injection (Legacy Compatibility)**
For legacy compatibility, you can inject configuration at runtime, but it's no longer required:
```javascript
// Optional - only needed for backward compatibility
window.appid = "visual-ai-studio";

// Firebase config no longer required
// All data is stored locally in the browser
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. API Configuration
All API keys should now be configured via environment variables:
- **Firebase**: Set via `REACT_APP_FIREBASE_*` variables
- **Gemini AI**: Set via `REACT_APP_GEMINI_API_KEY`
- **App ID**: Set via `REACT_APP_APP_ID`

**Important**: Never commit actual API keys to version control. Always use environment variables or runtime injection.

## Application Structure

```
src/
├── App.jsx                 # Main application component
├── components/
│   ├── Icons.jsx          # Lucide-style icon components (✅ COMPLETED)
│   ├── Toast.jsx          # Toast notification system (✅ COMPLETED)
│   ├── ErrorBoundary.jsx  # React error boundary (✅ COMPLETED)
│   ├── ErrorProvider.jsx  # Integrated error provider (✅ COMPLETED)
│   ├── ErrorHandlingExample.jsx  # Usage examples (✅ COMPLETED)
│   ├── SettingsPanel.jsx  # Brand kit and user settings
│   ├── StudioPage.jsx     # Main content creation interface
│   ├── PreviewPage.jsx    # Multi-platform preview with AI layouts
│   └── SchedulePage.jsx   # Deployment scheduling interface
├── utils/
│   ├── errorContext.js    # Error context and hooks (✅ COMPLETED)
│   ├── errorHandling.js   # Error handling utilities (✅ COMPLETED)
│   ├── localStorage.js    # Browser localStorage operations
│   ├── indexedDB.js       # Browser IndexedDB operations
│   ├── dataStorage.js     # Unified storage abstraction layer
│   └── gemini.js          # Gemini API helpers
└── constants/
    └── platforms.js       # Social platform configurations
```

## Main Features Breakdown

### Brand Kit Settings
- **5-Color Palette**: First 3 colors are mandatory
- **Typography Context**: Influences mood, not rendered text
- **Style Keywords**: Guides AI visual generation
- **Campaign Variable**: Temporary campaign-specific directives

### User Info (Social Connectors)
- Company/Influencer Name
- Primary Social Platform
- Social Handle/Username
- Mission/Bio Context

### Workflow
1. **Configure Brand Kit**: Set colors, typography, and style
2. **Create Content**: Define base prompt, message, and CTA
3. **AI Optimization**: System combines inputs with brand guidelines
4. **Generate Visual**: AI creates optimized image
5. **Multi-Platform Preview**: View layouts for 9 social formats
6. **Schedule Deployment**: Select formats and set timeline
7. **Commit**: Finalize and track scheduled posts

## API Integration Details

### Gemini API Endpoints
- **Text Generation**: `v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`
- **Image Generation**: `v1beta/models/gemini-2.5-flash-image-preview:generateContent`

### Local Storage Schema
```
localStorage:
  visualai_brand_kit          - Brand colors, typography, style keywords
  visualai_user_info          - Company name, social handle, bio
  visualai_campaign_variable  - Current campaign context
  visualai_app_preferences    - App settings and preferences
  visualai_recent_prompts     - Recently used prompts (limited history)

IndexedDB (VisualAIContentStudio):
  images/                     - Generated images with metadata
    {imageId}/
      - id, url, prompt, createdAt, platform, etc.
  layouts/                    - Layout configurations per image
    {layoutId}/
      - id, imageId, platform, layoutData
  projects/                   - Future: saved projects/campaigns
```

## Performance Considerations

- **Exponential Backoff**: API calls include retry logic with exponential delays
- **Local Storage Optimization**: Small data in localStorage, large data in IndexedDB
- **Blob URL Management**: Local uploads use revocable blob URLs
- **Auto-save**: Settings persist locally across sessions
- **Privacy First**: No data leaves your device unless explicitly shared

## Social Media Platform Support

| Platform | Format | Aspect Ratio | Use Cases |
|----------|--------|--------------|----------|
| Instagram | Story | 9:16 | Snapchat, TikTok |
| Instagram | Post | 1:1 | Facebook, LinkedIn |
| Facebook | Ad | 4:5 | Instagram Ads |
| YouTube | Thumbnail | 16:9 | Reddit, X/Twitter |
| Pinterest | Pin | 2:3 | Pinterest |
| X/Twitter | Card | 1.91:1 | LinkedIn, Facebook |
| TikTok | Vertical | 9:16 | Snapchat |
| Reddit | Image | 4:3 | Reddit |

## Customization

### Adding New Platforms
Update the `SOCIAL_PLATFORMS` array in `App.jsx`:
```javascript
{
  name: "Platform Name",
  ratio: "16:9",
  icon: "📱",
  platforms: ["Platform1", "Platform2"],
  thumbnailRatio: "16 / 9"
}
```

### Modifying AI Prompts
Edit system prompts in each AI feature function to adjust behavior:
- `refinePrompt`: Adjust prompt engineering style
- `generateCtaSuggestions`: Customize CTA tone
- `suggestCampaignTrend`: Modify trend analysis approach

## Troubleshooting

### Local Storage Issues
- Ensure browser supports localStorage and IndexedDB
- Check available storage space (Settings > Storage in browser)
- Clear browser data if storage seems corrupted
- Use incognito mode to test with fresh storage

### Image Generation Failures
- Confirm Gemini API key is valid
- Check API quotas in Google Cloud Console
- Review prompt content for policy violations

### Layout Generation Issues
- Verify all 9 platforms return layout data
- Check JSON schema matches expected structure
- Review browser console for parsing errors

## Future Enhancements

- [ ] Direct social media API integration (Instagram, Twitter, etc.)
- [ ] Advanced image editing tools
- [ ] Collaborative workspace features
- [ ] Analytics and performance tracking
- [ ] Template library
- [ ] Video content support
- [ ] Bulk content generation

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ using React, Firebase, and Google Gemini AI**
