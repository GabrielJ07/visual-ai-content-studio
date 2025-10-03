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

### 💾 Firebase Integration
- **Firestore Persistence**: Auto-save settings and content
- **Authentication**: Anonymous and custom token auth support
- **Recent Images**: Track generation history with metadata

## Tech Stack

- **Frontend**: React 18+ with Hooks
- **Styling**: Tailwind CSS (inline utility classes)
- **AI Models**: Google Gemini 2.5 Flash (Text & Image)
- **Backend**: Firebase (Firestore + Auth)
- **Icons**: Lucide-style SVG components

## Requirements

### Dependencies
```json
{
  "react": "^18.0.0",
  "firebase": "^10.0.0"
}
```

### Environment Variables
The app expects these to be injected at runtime:
- `firebaseconfig`: Firebase configuration JSON string
- `initialauthtoken`: (Optional) Custom auth token
- `appid`: Application identifier for Firestore paths

### API Keys
- **Gemini API Key**: Required for AI features (provided by Canvas runtime)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install react firebase
```

### 2. Configure Firebase
Create a Firebase project and enable:
- Firestore Database
- Authentication (Anonymous & Custom Token)

### 3. Set Environment Variables
Inject the following at build/runtime:
```javascript
window.firebaseconfig = JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
});

window.appid = "visual-ai-studio";
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access Gemini API
The app requires a Gemini API key. Update the `apiKey` constants in:
- `refinePrompt` function
- `generateCtaSuggestions` function
- `suggestCampaignTrend` function
- `generateAltText` function
- `generateImage` function
- `generateLayouts` function

## Application Structure

```
src/
├── App.jsx                 # Main application component
├── components/
│   ├── Icons.jsx          # Lucide-style icon components
│   ├── SettingsPanel.jsx  # Brand kit and user settings
│   ├── StudioPage.jsx     # Main content creation interface
│   ├── PreviewPage.jsx    # Multi-platform preview with AI layouts
│   └── SchedulePage.jsx   # Deployment scheduling interface
├── utils/
│   ├── firebase.js        # Firebase initialization
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

### Firestore Schema
```
artifacts/
  {appId}/
    users/
      {userId}/
        visualappsettings/
          config/
            - brandKit
            - userInfo
            - campaignVariable
        recentimages/
          {imageId}/
            - url (placeholder)
            - prompt
            - createdAt
```

## Performance Considerations

- **Exponential Backoff**: API calls include retry logic with exponential delays
- **Firestore Optimization**: Only metadata saved (not full base64 images)
- **Blob URL Management**: Local uploads use revocable blob URLs
- **Real-time Sync**: Settings auto-save and sync across sessions

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

### Firebase Connection Issues
- Verify `firebaseconfig` is valid JSON
- Check Firestore rules allow read/write for authenticated users
- Ensure anonymous auth is enabled in Firebase Console

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
