# 🤖 AI Agent - Full Stack Application

A production-ready AI Agent with chat, web search, file processing, memory, and multi-language support.

## 🚀 Features

- **AI Chat** - Conversational AI with streaming responses
- **Web Search** - Real-time web search with Google CSE
- **File Processing** - Upload and extract text from PDF, DOCX, Excel, images
- **Memory System** - Persistent user memory and preferences
- **Multi-Language** - English, Hausa, and Arabic (RTL support)
- **Voice Input** - Speech-to-text using Web Speech API
- **PWA** - Installable Progressive Web App
- **Admin Dashboard** - User management and system stats
- **Security** - JWT auth, rate limiting, encryption

## 📁 Project Structure

```
ai-agent-project/
├── backend/          # Node.js/Express API
│   ├── config/       # Database & Firebase config
│   ├── middleware/   # Auth, rate limit, error handler
│   ├── models/       # Data models (User, Message, etc.)
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic (AI, Search, Files)
│   └── utils/        # Helpers, validators, encryption
├── frontend/         # PWA (HTML/CSS/JS)
│   ├── css/          # Styles
│   ├── js/           # App logic
│   └── assets/       # Icons, images
└── docs/             # Documentation
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Firebase project
- OpenAI API key
- Google API key + Custom Search Engine ID

### Backend Setup

```bash
cd backend
npm install

# Create .env file (see .env.example)
cp .env.example .env

# Start server
npm run dev
```

### Frontend Setup

Serve the `frontend` folder with any static server:
```bash
# Option 1: Python
cd frontend && python -m http.server 8080

# Option 2: Node.js
npx serve frontend
```

### Firebase Setup

1. Create a Firebase project
2. Generate service account key
3. Add credentials to `.env`
4. Enable Firestore Database
5. Set up security rules

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/chat/message` | Send message |
| GET | `/api/chat/conversations` | List conversations |
| POST | `/api/files/upload` | Upload file |
| POST | `/api/search/web` | Web search |
| GET | `/api/memory` | Get memories |
| GET | `/api/admin/stats` | Admin stats |

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
JWT_SECRET=your-secret
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
GOOGLE_CSE_ID=...
```

## 📱 PWA Installation

1. Open the app in Chrome/Edge
2. Click "Install" in the address bar
3. The app will be added to your home screen

## 🌍 Languages

- **English** (`en`) - Default
- **Hausa** (`ha`) - RTL disabled
- **Arabic** (`ar`) - RTL enabled

## 📝 License

MIT License
