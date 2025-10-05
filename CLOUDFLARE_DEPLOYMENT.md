# Cloudflare Deployment Guide

This guide explains how to deploy Visual AI Content Studio on Cloudflare Workers and R2 storage.

## Prerequisites

- Cloudflare account with Workers and R2 enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Node.js 18+ and npm
- Git repository access

## Architecture Overview

The application uses a serverless architecture with:
- **Cloudflare Workers**: API endpoints for authentication and data management
- **Cloudflare R2**: Object storage for images and user data
- **React Frontend**: Deployed to Cloudflare Pages or Workers Sites
- **JWT Authentication**: Stateless authentication suitable for edge computing

## Step 1: Set Up Cloudflare Infrastructure

### 1.1 Create R2 Bucket

```bash
# Login to Cloudflare
wrangler login

# Create R2 bucket for the application
wrangler r2 bucket create visual-ai-content-studio

# Configure CORS for the bucket
wrangler r2 bucket cors put visual-ai-content-studio --cors-file cors-config.json
```

Create `cors-config.json`:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 1.2 Create Workers Project

```bash
# Create new Workers project
npm create cloudflare@latest visual-ai-api -- --type=hello-world

cd visual-ai-api

# Install dependencies
npm install @cloudflare/workers-types
npm install jose  # For JWT handling
```

## Step 2: Configure Workers API

### 2.1 Worker Configuration

Create or update `wrangler.toml`:

```toml
name = "visual-ai-api"
main = "src/index.js"
compatibility_date = "2024-01-01"

# R2 bucket binding
[[r2_buckets]]
binding = "STORAGE_BUCKET"
bucket_name = "visual-ai-content-studio"

# Environment variables
[env.production.vars]
JWT_SECRET = "your-jwt-secret-here"
GEMINI_API_KEY = "your-gemini-api-key"
ALLOWED_ORIGINS = "https://your-domain.com"

# KV namespace for session storage (optional)
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-namespace-id"
```

### 2.2 Worker Implementation

Create `src/index.js`:

```javascript
import { Router } from 'itty-router';
import { SignJWT, jwtVerify } from 'jose';
import { corsHeaders, handleCORS } from './cors';
import { authRoutes } from './routes/auth';
import { storageRoutes } from './routes/storage';
import { imageRoutes } from './routes/images';

const router = Router();

// CORS handling
router.all('*', handleCORS);

// Health check
router.get('/health', () => new Response('OK'));

// Authentication routes
router.all('/api/auth/*', authRoutes);

// Storage routes  
router.all('/api/settings/*', storageRoutes);

// Image routes
router.all('/api/images/*', imageRoutes);
router.all('/api/upload', imageRoutes);

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};
```

### 2.3 Authentication Routes

Create `src/routes/auth.js`:

```javascript
import { SignJWT, jwtVerify } from 'jose';
import { corsHeaders } from '../cors';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-secret'
);

export async function authRoutes(request, env) {
  const url = new URL(request.url);
  
  if (url.pathname === '/api/auth/anonymous' && request.method === 'POST') {
    return handleAnonymousAuth(request, env);
  }
  
  if (url.pathname === '/api/auth/custom' && request.method === 'POST') {
    return handleCustomAuth(request, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

async function handleAnonymousAuth(request, env) {
  try {
    const { appId } = await request.json();
    
    const userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const token = await new SignJWT({
      sub: userId,
      anonymous: true,
      appId: appId,
      created_at: new Date().toISOString()
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

    return new Response(JSON.stringify({ token, userId }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleCustomAuth(request, env) {
  try {
    const { token: customToken, appId } = await request.json();
    
    // Verify custom token (implement your verification logic)
    const userId = await verifyCustomToken(customToken);
    
    const token = await new SignJWT({
      sub: userId,
      anonymous: false,
      appId: appId,
      created_at: new Date().toISOString()
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

    return new Response(JSON.stringify({ token, userId }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function verifyCustomToken(token) {
  // Implement your custom token verification logic
  // This could involve checking against an external service
  throw new Error('Custom token verification not implemented');
}
```

## Step 3: Deploy the Backend

```bash
# Deploy to Cloudflare Workers
cd visual-ai-api
wrangler deploy

# Test the deployment
curl https://your-worker.your-subdomain.workers.dev/health
```

## Step 4: Deploy the Frontend

### 4.1 Update Frontend Configuration

Update your `.env.production`:

```bash
REACT_APP_CLOUDFLARE_ACCOUNT_ID=your_account_id
REACT_APP_CLOUDFLARE_R2_BUCKET=visual-ai-content-studio
REACT_APP_WORKER_URL=https://your-worker.your-subdomain.workers.dev
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_APP_ID=visual-ai-studio
```

### 4.2 Build and Deploy Frontend

```bash
# Build the React application
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name visual-ai-content-studio

# Or deploy using Pages dashboard by connecting your Git repository
```

## Step 5: Configure Custom Domain (Optional)

```bash
# Add custom domain to Pages
wrangler pages domain add visual-ai-content-studio your-domain.com

# Add custom domain to Workers (if needed)
wrangler custom-domains add your-api-domain.com --zone-id YOUR_ZONE_ID
```

## Security Considerations

### JWT Secret Management

- Use Wrangler secrets for production JWT secrets:
  ```bash
  wrangler secret put JWT_SECRET
  ```

### CORS Configuration

- Configure CORS properly for your domain
- Use environment-specific allowed origins
- Implement proper authentication checks

### R2 Access Control

- Use IAM policies to restrict R2 access
- Implement proper authentication for all endpoints
- Consider using signed URLs for direct uploads

## Monitoring and Logging

### Worker Analytics

Monitor your deployment using:
- Cloudflare Workers Analytics dashboard
- Real-time logs with `wrangler tail`
- Custom metrics and alerts

### Error Handling

Implement comprehensive error handling:
- Structured logging
- Error reporting to external services
- Graceful degradation for API failures

## Development Workflow

### Local Development

```bash
# Start local development server for Workers
cd visual-ai-api
wrangler dev

# Start local development server for React
cd ../
npm run dev
```

### Environment Management

- Use `wrangler.toml` environments for staging/production
- Implement proper secret management
- Use different R2 buckets for different environments

## Cost Optimization

### Workers Optimization

- Minimize cold start times
- Use appropriate Worker size/memory limits
- Implement efficient caching strategies

### R2 Storage Optimization  

- Implement lifecycle policies for old images
- Use appropriate storage classes
- Monitor bandwidth usage

## Troubleshooting

### Common Issues

1. **CORS Errors**: Verify CORS configuration in both R2 and Workers
2. **Authentication Failures**: Check JWT secret configuration
3. **Upload Failures**: Verify R2 permissions and Worker bindings
4. **Performance Issues**: Monitor Worker execution time and optimize

### Debugging Commands

```bash
# View Worker logs in real-time
wrangler tail

# Test R2 operations
wrangler r2 object get visual-ai-content-studio/test.txt

# Check Worker configuration
wrangler whoami
```

## Migration from Firebase

If migrating from Firebase:

1. **Data Export**: Export existing Firestore data
2. **Data Transformation**: Convert to R2-compatible format  
3. **Authentication Migration**: Migrate user sessions to JWT
4. **Testing**: Thoroughly test all functionality
5. **Gradual Migration**: Consider a phased approach

## Best Practices

1. **Security**: Always validate inputs and authenticate requests
2. **Performance**: Use edge caching and optimize Worker execution
3. **Reliability**: Implement proper error handling and retries
4. **Monitoring**: Set up comprehensive monitoring and alerting
5. **Documentation**: Keep deployment documentation updated

## Support and Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Community Support](https://community.cloudflare.com/)