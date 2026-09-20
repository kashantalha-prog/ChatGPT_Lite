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
CORS_ORIGIN=*
```

4. Start:

```bash
npm start
```

5. Open:

http://localhost:3000

## GitHub Pages

GitHub Pages can host the frontend files, but it cannot run `server.js` or keep the Gemini API key secret. The included GitHub Actions workflow publishes the `public` folder automatically.

1. Push the repository to GitHub with the default branch named `main`.
2. In GitHub, open **Settings > Pages** and choose **GitHub Actions** as the source.
3. Deploy this Node backend separately on a Node host such as Render or Railway.
4. Put that backend URL in `public/config.js`:

```js
window.CHATGPT_CONFIG = { backendUrl: 'https://your-backend.example.com' };
```

5. Push again and open the GitHub Pages URL. Do not put `GEMINI_API_KEY` in `public/config.js`.

## Important
- Do NOT put the Gemini key in `index.html`.
- Do NOT upload `.env` or `node_modules` to GitHub.
- `node_modules` is created automatically by `npm install`.
- The + attachment button sends the actual image data to the Node backend for Gemini image understanding.
- This project limits inline images to 10 MB each and up to 4 images per message.
- Free-tier availability and limits depend on Google's current Gemini API terms and model limits.
