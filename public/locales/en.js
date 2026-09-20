window.CHATGPT_LOCALES = window.CHATGPT_LOCALES || {};
window.CHATGPT_LOCALES.en = {
  name: 'English', direction: 'ltr', speech: 'en-US',
  newChat: 'New chat', searchChats: 'Search chats', files: 'Files', chats: 'Chats', myAccount: 'My account',
  openSidebar: 'Open sidebar', share: 'Share', copied: 'Copied', more: 'More', viewFiles: 'View files in chat',
  pinChat: 'Pin chat', archive: 'Archive', exportChat: 'Export chat', theme: 'Dark / Light theme', settings: 'Settings', deleteChat: 'Delete chat',
  attachFiles: 'Attach files', messagePlaceholder: 'Message ChatGPT Lite...', thinkMode: 'Think mode', thinkModeOn: 'Think mode ON', voiceInput: 'Voice input', send: 'Send',
  hint: 'ChatGPT Lite can make mistakes. Check important information.', welcomeTitle: 'How can I help you?', welcomeText: 'Ask anything, attach an image, and ChatGPT Lite will respond using Gemini.',
  geminiApi: 'Gemini API', apiNotice: 'Your Gemini API key is kept on the Node.js server. Put it in .env as GEMINI_API_KEY=...; never paste it into this browser.',
  geminiModel: 'Gemini model', backend: 'Backend', systemInstructions: 'System instructions', instructions: 'You are ChatGPT Lite, a helpful, accurate and friendly AI assistant. Answer clearly and naturally. If you are uncertain, say so instead of inventing facts.',
  apiStatus: 'Gemini responses and image analysis are handled by the secure Node.js backend.', language: 'Language', cancel: 'Cancel', save: 'Save',
  delete: 'Delete', copy: 'Copy', shareFailed: 'Share link could not be copied.', deleteConfirm: 'Delete this chat?', archived: 'Chat archived locally.', pinned: 'Chat pinned.', unpinned: 'Chat unpinned.',
  noFiles: 'No files attached to the current message.', currentFiles: 'Current message files: {files}', attachHelp: 'Use the + button in the message box to attach images.', searchPrompt: 'Search chats:', noMatch: 'No matching chat found.',
  serverSetup: 'Gemini is configured on the server. Add your key to the .env file.\n\nGEMINI_API_KEY=your_key_here', saveSetup: 'Server-side Gemini setup is used. Edit .env, then restart npm start.',
  voiceUnsupported: 'Voice input is not supported by this browser.', imageOnly: 'This version supports image attachments for Gemini vision.', imageTooLarge: '{name} is larger than 10 MB.', analyzeImages: 'Please analyze the attached image(s).', noResponse: 'No response received.'
};
