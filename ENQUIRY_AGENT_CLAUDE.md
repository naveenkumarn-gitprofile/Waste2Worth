# Enquiry Agent - Claude API Integration

## Overview
The NutriWasteAI Enquiry Agent is a general-purpose conversational chatbot powered by Anthropic's Claude API. It can handle questions about the platform, food science, nutrition, sustainability, or general topics with multi-turn conversation support.

## Architecture

### Backend
- **API Endpoint**: `POST /enquiry/chat`
- **LLM Integration**: Direct Anthropic Claude API (no external service container)
- **Model**: Claude 3.5 Sonnet (configurable)
- **Multi-turn Support**: Conversation history maintained per session
- **Rate Limiting**: 10 messages per minute per session (configurable)

### Frontend
- **Component**: Floating chat widget with minimize/close functionality
- **State Management**: Client-side conversation history
- **UI**: Green-themed chat interface matching NutriWasteAI design
- **Positioning**: Fixed bottom-right, responsive design

## Setup

### 1. Environment Variables

Add to `backend/.env`:
```env
ANTHROPIC_API_KEY=your-anthropic-api-key-here
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=1024
CHAT_RATE_LIMIT_PER_MINUTE=10
```

### 2. Get Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Create an API key
4. Add the key to your `.env` file

### 3. Install Dependencies

```bash
cd backend
pip install anthropic==0.18.0
```

## Usage

### API Endpoint

```bash
curl -X POST http://localhost:8000/enquiry/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What does NutriWasteAI do?",
    "conversation_history": []
  }'
```

### Multi-turn Conversation

To maintain context across multiple messages, include the conversation history:

```bash
curl -X POST http://localhost:8000/enquiry/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you tell me more about manual analysis?",
    "conversation_history": [
      {"role": "user", "content": "What does NutriWasteAI do?"},
      {"role": "assistant", "content": "NutriWasteAI is a platform for..."}
    ]
  }'
```

## System Prompt

The system prompt is defined in `backend/app/api/enquiry.py` and can be modified to adjust the assistant's persona and context grounding:

```python
SYSTEM_PROMPT = """You are the Enquiry Agent for NutriWasteAI...
"""
```

This is the single place to adjust the assistant's behavior without changing the request/response plumbing.

## Features

### General-Purpose Conversation
- Handles platform-specific questions (via system prompt context)
- Answers general knowledge questions
- Engages in casual conversation
- No restricted answer set
- No keyword matching or decision trees

### Multi-turn Memory
- Maintains conversation context within a session
- Remembers previous questions and answers
- Provides coherent follow-up responses

### Rate Limiting
- Prevents API cost overruns
- Configurable limits per session
- Graceful error messages when limits exceeded

### Error Handling
- API key missing: Clear configuration error
- Rate limit exceeded: Specific 429 response
- API errors: Graceful degradation
- Network timeouts: Proper timeout handling

## Frontend Integration

### Chat Widget
- **Launcher**: MessageCircle icon in navbar
- **Position**: Fixed bottom-right (responsive)
- **Features**: Minimize, close, typing indicator
- **Theme**: Supports light/dark mode

### Conversation State
- Maintained client-side
- Sent with each new message
- Provides context to Claude API

## Configuration Options

### Backend Configuration
- `ANTHROPIC_API_KEY`: Your Claude API key (required)
- `CLAUDE_MODEL`: Claude model to use (default: claude-3-5-sonnet-20241022)
- `CLAUDE_MAX_TOKENS`: Maximum response tokens (default: 1024)
- `CHAT_RATE_LIMIT_PER_MINUTE`: Rate limit per session (default: 10)

### Frontend Configuration
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

## Troubleshooting

### "Claude API key not configured"
- Add `ANTHROPIC_API_KEY` to your `.env` file
- Restart the backend server

### "Rate limit exceeded"
- Wait a moment before sending another message
- Adjust `CHAT_RATE_LIMIT_PER_MINUTE` in configuration

### "Unable to connect to Claude API"
- Check your internet connection
- Verify your API key is valid
- Check Anthropic service status

### Slow responses
- Increase timeout in frontend (currently 30 seconds)
- Consider using a faster Claude model
- Check network latency

## Migration from AnythingLLM

### What Was Removed
- AnythingLLM Docker service
- Docker compose configuration
- Document ingestion workflow
- Knowledge base setup
- RAG-based retrieval

### What Was Added
- Direct Claude API integration
- System prompt-based context
- Multi-turn conversation support
- Simplified architecture
- General-purpose capability

### Benefits
- No external service to manage
- Simpler setup and maintenance
- More general-purpose conversations
- Better multi-turn memory
- Reduced infrastructure complexity

## Security Notes

- API key is stored in environment variables (never in code)
- API key is never exposed to the frontend
- Rate limiting prevents cost overruns
- No sensitive data sent with requests (only conversation history)

## Cost Considerations

- Claude API costs are based on token usage
- Rate limiting helps control costs
- Consider setting lower `CLAUDE_MAX_TOKENS` for cost control
- Monitor usage in Anthropic Console

## Future Enhancements

Potential improvements:
- Conversation persistence to database
- User-specific rate limits
- Streaming responses for real-time feel
- Conversation export functionality
- Analytics on common questions

## Support

For issues with:
- **Claude API**: Check [Anthropic Status](https://status.anthropic.com/)
- **Integration**: Review logs in backend terminal
- **Frontend**: Check browser console for errors
