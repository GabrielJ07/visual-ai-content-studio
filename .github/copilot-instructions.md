# GitHub Copilot Instructions for Visual AI Content Studio

## Project Overview

Visual AI Content Studio is an AI-powered visual content creation platform for social media with brand kit management, multi-platform preview, and Cloudflare Workers/R2 integration. The application generates stunning visuals optimized for Instagram, TikTok, YouTube, LinkedIn, and other social platforms using Google's Gemini AI.

## Technology Stack

- **Frontend**: React 18+ with Hooks
- **Styling**: Tailwind CSS (inline utility classes)
- **AI Models**: Google Gemini 2.5 Flash (Text & Image generation)
- **Backend**: Cloudflare Workers + R2 Storage
- **Icons**: Custom Lucide-style SVG components
- **Build Tools**: Modern JavaScript ES6+

## Project Structure

```
src/
├── App.jsx                 # Main application component
├── components/
│   ├── Icons.jsx          # Lucide-style icon components (✓ Complete)
│   ├── SettingsPanel.jsx  # Brand kit and user settings
│   ├── StudioPage.jsx     # Main content creation interface
│   ├── PreviewPage.jsx    # Multi-platform preview with AI layouts
│   └── SchedulePage.jsx   # Deployment scheduling interface
├── utils/
│   ├── storage.js        # Cloudflare R2 storage utilities
│   ├── auth.js          # JWT authentication for Workers
│   ├── gemini.js          # Gemini API helpers
│   └── errorContext.js    # Error handling context (✓ Complete)
└── constants/
    └── platforms.js       # Social platform configurations
```

## Development Guidelines

### Code Style & Patterns

1. **React Components**:
   - Use functional components with React Hooks
   - Follow camelCase naming for functions and variables
   - Use PascalCase for component names
   - Implement proper error boundaries and error handling

2. **Styling**:
   - Use Tailwind CSS utility classes inline
   - Follow mobile-first responsive design
   - Maintain consistent spacing and typography scales
   - Use semantic color classes when possible

3. **State Management**:
   - Use React's built-in useState and useContext for state
   - Implement custom hooks for complex logic
   - Use useCallback and useMemo for performance optimization

4. **Error Handling**:
   - Use the existing ErrorContext for consistent error handling
   - Implement proper try-catch blocks for async operations
   - Provide user-friendly error messages with actionable feedback
   - Log errors appropriately for debugging

### API Integration Patterns

#### Cloudflare Integration
- Use Cloudflare Workers for serverless API endpoints
- Implement JWT-based authentication suitable for Workers
- Use R2 storage for persistent image and content storage
- Follow these patterns for storage operations:
  ```javascript
  // Import pattern
  import { storage, auth } from './utils/storage.js';
  
  // Error handling pattern
  try {
    const result = await storage.saveConfig(userId, config);
    // Handle success
  } catch (error) {
    handleStorageError(error, 'operation description');
  }
  ```

#### Gemini AI Integration
- Store API keys securely (not in code)
- Implement retry logic for API calls
- Use proper content filtering and safety settings
- Follow these patterns:
  ```javascript
  // API call pattern with retry
  const response = await fetchWithRetry(url, options);
  
  // Error handling for AI operations
  try {
    const result = await generateContent(prompt);
  } catch (error) {
    handleApiError(error, 'AI generation');
  }
  ```

### Component Development

#### Icon Components
- Follow the existing Lucide-style pattern in `src/components/Icons.jsx`
- Use consistent SVG attributes: `width="24" height="24" viewBox="0 0 24 24"`
- Include proper stroke and fill properties
- Export as named exports

#### UI Components
- Implement responsive design for mobile and desktop
- Use proper ARIA attributes for accessibility
- Include loading states for async operations
- Implement proper form validation

### Platform Configuration

When adding new social media platforms:
1. Update the `SOCIAL_PLATFORMS` array in `constants/platforms.js`
2. Include proper aspect ratios and dimensions
3. Add platform-specific icons and branding
4. Update layout generation logic accordingly

### Brand Kit Management

- Support up to 5 colors with first 3 being mandatory
- Implement color validation (hex format)
- Store typography context for AI mood generation
- Support style keywords for visual generation guidance
- Implement campaign variables for temporary directives

### Content Generation Workflow

1. **Brand Kit Configuration**: Colors, typography, style keywords
2. **Content Creation**: Base prompt, message, call-to-action
3. **AI Optimization**: Combine inputs with brand guidelines
4. **Visual Generation**: Create optimized images via Gemini
5. **Multi-Platform Preview**: Generate layouts for 9 formats
6. **Scheduling**: Select platforms and deployment timeline
7. **Commitment**: Finalize and track scheduled posts

### Testing & Quality Assurance

- Test Cloudflare Workers API and R2 storage connections
- Validate API integrations with proper error handling
- Test responsive design across different screen sizes
- Verify accessibility compliance (WCAG guidelines)
- Test image generation and layout optimization

### Performance Considerations

- Implement proper loading states for AI operations
- Use lazy loading for images and heavy components
- Optimize bundle size with proper imports
- Implement caching for repeated API calls
- Monitor Cloudflare Workers usage and R2 storage quotas

### Security Guidelines

- Never commit API keys or sensitive credentials
- Use environment variables for configuration
- Implement proper input validation and sanitization
- Follow Cloudflare Workers security best practices
- Validate user inputs before AI processing

### AI Content Guidelines

- Implement content filtering for generated images
- Provide clear user feedback during generation processes
- Handle API rate limits and quotas gracefully
- Implement proper prompt engineering techniques
- Ensure generated content follows platform guidelines

## Common Patterns to Follow

### Error Handling
```javascript
import { useError } from '../utils/errorContext';

const { handleApiError, handleStorageError } = useError();

// In async operations
try {
  const result = await someOperation();
} catch (error) {
  handleApiError(error, 'operation name');
}
```

### Loading States
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleAsyncOperation = async () => {
  setIsLoading(true);
  try {
    // Operation
  } finally {
    setIsLoading(false);
  }
};
```

### Platform Configuration
```javascript
const platformConfig = {
  name: "Platform Name",
  ratio: "16:9",
  icon: "📱",
  platforms: ["Platform1", "Platform2"],
  thumbnailRatio: "16 / 9"
};
```

## Debugging Tips

- Check browser console for API errors and Cloudflare connection issues
- Verify Cloudflare configuration in browser storage
- Monitor network requests for API call failures
- Use React Developer Tools for component debugging
- Check Firestore rules for permission issues

## Contributing Guidelines

- Follow the existing code organization structure
- Maintain consistency with established patterns
- Add proper error handling for all new features
- Update documentation when adding new functionality
- Test thoroughly before committing changes

This project emphasizes user experience, AI integration, and multi-platform social media optimization. When contributing, focus on these core aspects while maintaining code quality and performance standards.