# Error Handling Guide

This document outlines the user-friendly error handling system that replaces `console.error` with actionable UI feedback.

## Overview

Instead of using `console.error` which is invisible to users, this system provides:

- ✅ **Toast notifications** for immediate user feedback
- ✅ **Error boundaries** to catch React errors gracefully  
- ✅ **Centralized error context** for consistent error handling
- ✅ **Actionable error messages** with retry/fix options
- ✅ **Context-aware error handling** for different scenarios

## Quick Start

### 1. Wrap Your App

```jsx
import ErrorProvider from './src/components/ErrorProvider.jsx';

function App() {
  return (
    <ErrorProvider>
      <YourAppComponents />
    </ErrorProvider>
  );
}
```

### 2. Use Error Hooks

```jsx
import { useError } from './src/utils/errorContext.js';

function MyComponent() {
  const { showError, showSuccess, handleApiError } = useError();
  
  const handleSubmit = async () => {
    try {
      await apiCall();
      showSuccess('Settings saved successfully!');
    } catch (error) {
      handleApiError(error, 'save settings');
    }
  };
}
```

## Components

### ErrorProvider
Main provider that wraps your app with error handling capabilities.

```jsx
<ErrorProvider>
  <App />
</ErrorProvider>
```

### Toast Notifications
Automatic toast notifications for different error types:
- **Error** (red): Critical issues requiring user action
- **Warning** (yellow): Important notices  
- **Success** (green): Confirmation messages
- **Info** (blue): General information

### Error Boundary
Catches JavaScript errors in React component tree and displays user-friendly fallback UI.

## API Reference

### useError Hook

```jsx
const {
  // Toast functions
  showError,     // (message, action?) => id
  showWarning,   // (message, action?, duration?) => id  
  showSuccess,   // (message, duration?) => id
  showInfo,      // (message, action?, duration?) => id
  
  // Specialized handlers
  handleNetworkError,  // (error, context?) => id
  handleApiError,      // (error, operation?) => id  
  handleFirebaseError, // (error, operation?) => id
  
  // Toast management
  removeToast,   // (id) => void
  clearToasts,   // () => void
  toasts         // current toasts array
} = useError();
```

### Error Handlers

Pre-built error handlers for common scenarios:

```jsx
import { errorHandlers } from './src/utils/errorHandling.js';

// API errors
errorHandlers.api.imageGeneration(error, showError);
errorHandlers.api.textGeneration(error, showError);
errorHandlers.api.layoutGeneration(error, showError);

// Firebase errors  
errorHandlers.firebase.auth(error, showError);
errorHandlers.firebase.firestore(error, showError, 'save data');

// File errors
errorHandlers.file.upload(error, showError);
errorHandlers.file.processing(error, showError);
```

## Usage Patterns

### ❌ Instead of console.error

```jsx
// DON'T DO THIS
try {
  await generateImage(prompt);
} catch (error) {
  console.error('Image generation failed:', error);
}
```

### ✅ Use user-friendly feedback

```jsx
// DO THIS
try {
  await generateImage(prompt);
  showSuccess('Image generated successfully!');
} catch (error) {
  errorHandlers.api.imageGeneration(error, showError);
}
```

### Async Operations with Error Handling

```jsx
import { withErrorHandling } from './src/utils/errorHandling.js';

const safeApiCall = withErrorHandling(
  async (prompt) => {
    return await generateImage(prompt);
  },
  errorHandlers.api.imageGeneration,
  showError
);
```

### Network Error Handling

```jsx
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw response;
    return response.json();
  } catch (error) {
    handleNetworkError(error, 'load data');
  }
};
```

### Firebase Error Handling

```jsx
const saveSettings = async (settings) => {
  try {
    await db.collection('settings').doc(userId).set(settings);
    showSuccess('Settings saved!');
  } catch (error) {
    handleFirebaseError(error, 'save settings');
  }
};
```

## Error Message Guidelines

### Good Error Messages

- ✅ Clear and specific: "Failed to generate image. Please try a different prompt."
- ✅ Actionable: "No internet connection. Please check your network and try again."
- ✅ Include next steps: Provide retry buttons or alternative actions
- ✅ Context-aware: "Permission denied for saving settings. Please sign in again."

### Poor Error Messages  

- ❌ Generic: "Something went wrong"
- ❌ Technical jargon: "HTTP 500 Internal Server Error"  
- ❌ No guidance: "Error occurred"
- ❌ Blame user: "You did something wrong"

## Customization

### Custom Error Types

```jsx
const { addToast } = useError();

addToast({
  type: 'custom',
  message: 'Custom message',
  duration: 5000,
  action: {
    label: 'Action',
    onClick: () => console.log('Action clicked')
  }
});
```

### Custom Styling

Modify the Toast component's Tailwind classes to match your design system.

### Error Reporting

In production, replace the development logging with proper error reporting:

```jsx
// In src/utils/errorHandling.js
if (process.env.NODE_ENV === 'production') {
  // Replace with your error reporting service
  Sentry.captureException(error, { extra: errorDetails });
}
```

## Development Tools

### View Error Log

```jsx
import { getErrorLog, clearErrorLog } from './src/utils/errorHandling.js';

console.log(getErrorLog()); // View all logged errors
clearErrorLog(); // Clear error log
```

### Error Testing

Use the `ErrorHandlingExample` component to test different error scenarios:

```jsx
import ErrorHandlingExample from './src/components/ErrorHandlingExample.jsx';

// Add to your development routes
<ErrorHandlingExample />
```

## Migration Checklist

To replace existing `console.error` usage:

- [ ] Wrap app with `ErrorProvider`
- [ ] Replace `console.error` with appropriate `showError` calls
- [ ] Add actionable error messages with retry options  
- [ ] Use specialized handlers for API, Firebase, and file operations
- [ ] Add success feedback for positive outcomes
- [ ] Test error scenarios with `ErrorHandlingExample`
- [ ] Configure production error reporting
- [ ] Remove or replace development console logs

## Best Practices

1. **Always provide user feedback** - Never fail silently
2. **Make errors actionable** - Include retry buttons or next steps
3. **Be specific** - Explain what went wrong and why
4. **Test error paths** - Verify error handling works as expected
5. **Log for debugging** - Keep technical details for developers
6. **Handle edge cases** - Network offline, permissions, etc.
7. **Progressive disclosure** - Show simple message, allow details expansion
8. **Consistent styling** - Use the same error UI patterns throughout

## Examples

See `src/components/ErrorHandlingExample.jsx` for comprehensive usage examples.