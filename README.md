# ChatGPT Lite — Gemini Free Tier + Node.js

This version replaces the browser-side OpenAI API with a Node.js backend and Google Gemini API. It supports normal chat plus real image analysis.

## Requirements
- Node.js 18.18+ (your Node 24.x is fine)
- npm
- A Gemini API key from Google AI Studio

## Run on Windows CMD

1. Open CMD inside this folder.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` by copying `.env.example` and put your key in it:

```env
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3000
HOST=127.0.0.1
```

4. Start:

```bash
npm start
```

5. Open:

http://localhost:3000

## Important
- Do NOT put the Gemini key in `index.html`.
- Do NOT upload `.env` or `node_modules` to GitHub.
- `node_modules` is created automatically by `npm install`.
- The + attachment button sends the actual image data to the Node backend for Gemini image understanding.
- This project limits inline images to 10 MB each and up to 4 images per message.
- Free-tier availability and limits depend on Google's current Gemini API terms and model limits.
