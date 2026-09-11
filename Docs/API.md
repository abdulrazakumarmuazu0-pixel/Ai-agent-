# AI Agent API Documentation

## Authentication

All endpoints except `/api/auth/*` require a Bearer token in the Authorization header.

```
Authorization: Bearer <token>
```

## Endpoints

### Auth

#### POST /api/auth/register
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe",
  "language": "en"
}
```

#### POST /api/auth/login
Login existing user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Chat

#### POST /api/chat/message
Send a message to the AI.

**Body:**
```json
{
  "message": "Hello, how are you?",
  "conversationId": "uuid (optional)",
  "language": "en"
}
```

#### GET /api/chat/conversations
Get user's conversations.

**Query:** `limit=20`

### Files

#### POST /api/files/upload
Upload a file.

**Form Data:**
- `file` - File to upload
- `conversationId` (optional)
- `description` (optional)

### Search

#### POST /api/search/web
Perform web search.

**Body:**
```json
{
  "query": "latest AI news",
  "numResults": 10,
  "language": "en"
}
```

### Memory

#### POST /api/memory
Save a memory.

**Body:**
```json
{
  "key": "user_name",
  "value": "John",
  "type": "user_preference",
  "importance": 5
}
```

#### GET /api/memory
Get all memories for current user.

### Admin

#### GET /api/admin/stats
Get system statistics (admin only).

#### GET /api/admin/users
List all users (admin only).
