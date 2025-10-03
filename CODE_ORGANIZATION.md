# Code Organization Guide

This document explains how the monolithic code from `paste.txt` should be organized into the proper folder structure.

## Current Structure

```
visual-ai-content-studio/
├── src/
│   └── components/
│       └── Icons.jsx          ✓ COMPLETED
├── .gitignore
└── README.md
```

## Target Structure (from README.md)

The complete application should be organized as follows:

```
src/
├── App.jsx                 # Main application component
├── components/
│   ├── Icons.jsx          # ✓ Lucide-style icon components (DONE)
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

## Code from paste.txt - Organization Breakdown

The `paste.txt` file contains a large monolithic React application that needs to be split into the files above. Here's how to organize it:

### 1. src/components/Icons.jsx ✓
**Status: COMPLETED**
- Extract all icon components (SettingsIcon, ZapIcon, SparklesIcon, etc.)
- Already created and committed

### 2. src/constants/platforms.js
**Extract from paste.txt:**
- `SOCIAL_PLATFORMS` array
- Platform configurations (Instagram, Facebook, YouTube, etc.)

### 3. src/utils/firebase.js
**Extract from paste.txt:**
- `initializeApp` imports
- Firebase configuration setup
- Auth and Firestore initialization
- Path constants (SETTINGS_COLLECTION, SETTINGS_DOC_ID, etc.)

### 4. src/utils/gemini.js
**Extract from paste.txt:**
- `fetchWithRetry` function
- `base64ToDataParts` function
- All AI/Gemini API helper functions

### 5. src/components/SettingsPanel.jsx
**Extract from paste.txt:**
- The entire SettingsPanel component
- Includes Brand Kit settings, Campaign Variable, and User Info

### 6. src/components/StudioPage.jsx
**Extract from paste.txt:**
- The StudioPage component
- Content input forms
- Image generation UI
- Alt text generation
- Recent images carousel

### 7. src/components/PreviewPage.jsx
**Extract from paste.txt:**
- SocialPreviewPage component
- SocialPreview component
- Multi-platform preview grid
- Layout generation logic

### 8. src/components/SchedulePage.jsx
**Extract from paste.txt:**
- SchedulePage component
- Deployment timeline
- Countdown timers
- Commit functionality

### 9. src/App.jsx
**Extract from paste.txt:**
- Main App component
- All React hooks (useState, useEffect, useCallback, etc.)
- State management
- Page navigation logic
- Helper functions (formatCountdown, etc.)
- Default settings
- Main render logic

## Implementation Notes

### Key Points:
1. **Icons.jsx is complete** - This file has been extracted and committed
2. **Large monolithic file** - The paste.txt contains ~5000+ lines of code that needs to be split
3. **Proper imports** - Each file will need proper import statements for:
   - React and hooks
   - Firebase modules
   - Icon components  
   - Other components and utilities

### Dependencies Between Files:
- App.jsx imports all page components
- Page components import Icons.jsx
- Components use utils/firebase.js and utils/gemini.js
- App.jsx and components use constants/platforms.js

### State Management:
- Most state is managed in App.jsx
- Props are passed down to child components
- Firebase integration is centralized

## Next Steps

To complete the organization:

1. Extract constants/platforms.js from paste.txt
2. Extract utils/firebase.js helpers
3. Extract utils/gemini.js helpers  
4. Split the remaining components (SettingsPanel, StudioPage, PreviewPage, SchedulePage)
5. Create the main App.jsx with imports
6. Add package.json with dependencies
7. Test the organized structure

## Reference

- **Source**: `paste.txt` (attached file)
- **README**: See README.md for full application documentation
- **Structure**: Based on standard React application architecture

---

**Note**: The code in paste.txt is a single-file React application. Breaking it into this structure will improve:
- Code maintainability
- Component reusability
- Developer experience
- Build optimization
- Testing capabilities
