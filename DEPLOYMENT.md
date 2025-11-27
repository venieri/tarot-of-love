# Deployment Guide - Lydia Venieri's Tarot of Love

## 🚨 IMPORTANT: API Key Security

**Never commit your API key to git!** The `.gitignore` has been updated to exclude `src/lib/config.js`.

For production deployments, use environment variables instead of hardcoding the API key.

---

## Option 1: Deploy as Web App (Vercel/Netlify) 🌐

### A. Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Set Environment Variable**:
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add: `VITE_OPENAI_API_KEY` = `your-api-key-here`
   - Redeploy

4. **Update config to use environment variable**:

Edit `src/lib/config.js`:
```javascript
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_API_KEY_HERE';
```

### B. Netlify

1. **Build the app**:
```bash
npm run build
```

2. **Deploy via Netlify CLI**:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

3. **Set Environment Variable**:
   - Site settings → Environment variables
   - Add: `VITE_OPENAI_API_KEY`

### C. GitHub Pages

1. **Install adapter**:
```bash
npm install -D @sveltejs/adapter-static
```

2. **Build**:
```bash
npm run build
```

3. **Deploy** the `build` folder to GitHub Pages

---

## Option 2: Desktop App with Tauri 🖥️

### Build for Current Platform

```bash
npm run tauri build
```

This creates:
- **macOS**: `.app` in `src-tauri/target/release/bundle/macos/`
- **Windows**: `.exe` and `.msi` in `src-tauri/target/release/bundle/`
- **Linux**: `.deb`, `.AppImage` in `src-tauri/target/release/bundle/`

### Build for Multiple Platforms

Use GitHub Actions for cross-platform builds:

**.github/workflows/release.yml**:
```yaml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Option 3: Both Web + Desktop 🌐🖥️

1. **Deploy web version** to Vercel/Netlify
2. **Build desktop apps** with Tauri
3. **Distribute desktop apps** via:
   - GitHub Releases
   - Your website
   - App stores (Mac App Store, Windows Store)

---

## Security Best Practices 🔒

### For Web Deployment

**IMPORTANT**: Exposing your API key in client-side code is a security risk!

**Better approach - Use a backend proxy**:

1. Create a serverless function (e.g., Vercel Functions):

`api/reading.js`:
```javascript
export default async function handler(req, res) {
  const { question, cards } = req.body;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [/* your prompt */]
    })
  });

  const data = await response.json();
  res.json(data);
}
```

2. Update your app to call `/api/reading` instead of OpenAI directly

### For Desktop App

Desktop apps can safely include the API key since the code is bundled and harder to extract.

---

## Quick Start Commands

### Development
```bash
npm run dev              # Web development server
npm run tauri dev        # Desktop app development
```

### Testing
```bash
npm run test            # Run unit tests
npm run test:run        # Run tests once
npm run test:integration # Test OpenAI integration
```

### Production Build
```bash
npm run build           # Build web app
npm run tauri build     # Build desktop app
```

### Deployment
```bash
vercel                  # Deploy to Vercel
netlify deploy --prod   # Deploy to Netlify
```

---

## Recommended: Web App with Backend

For the best security and user experience:

1. **Frontend**: Deploy SvelteKit app to Vercel
2. **Backend**: Use Vercel Serverless Functions for API calls
3. **API Key**: Store securely in Vercel environment variables
4. **Desktop**: Optional Tauri builds for offline use

This keeps your API key secure and provides the best of both worlds!
