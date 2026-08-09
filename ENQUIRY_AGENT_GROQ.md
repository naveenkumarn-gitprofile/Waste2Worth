# Enquiry Agent - Groq API Integration

## Overview
The NutriWasteAI Enquiry Agent is a general-purpose conversational chatbot powered by **Groq's free API**. It uses the llama-3.3-70b-versatile model for high-quality responses without any billing or credit card requirements.

## Architecture

### Backend
- **API Endpoint**: `POST /enquiry/chat`
- **LLM Integration**: Direct Groq API (OpenAI-compatible format)
- **Model**: llama-3.3-70b-versatile (configurable)
- **Multi-turn Support**: Conversation history maintained per session
- **Rate Limiting**: 10 messages per minute per session (configurable)
- **Cost**: Completely free with generous daily limits

### Frontend
- **Component**: Floating chat widget with minimize/close functionality
- **State Management**: Client-side conversation history
- **UI**: Green-themed chat interface matching NutriWasteAI design
- **Positioning**: Fixed bottom-right, responsive design

## Setup

### 1. Create Groq Account

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up for a free account (no credit card required)
3. Log in to the console

### 2. Generate API Key

1. In the Groq Console, navigate to API Keys
2. Click "Create API Key"
3. Name your key (e.g., "NutriWasteAI Chatbot")
4. Copy the generated key

### 3. Configure Environment Variables

Add to `backend/.env`:
```env
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=1024
CHAT_RATE_LIMIT_PER_MINUTE=10
```

### 4. No Additional Dependencies

Groq uses standard HTTP requests (httpx), so no additional packages are needed beyond what's already in requirements.txt.

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

## Available Models

Groq offers several models. The default is `llama-3.3-70b-versatile` which provides a good balance of quality and speed. Other options include:

- `llama-3.3-70b-versatile` (default, best quality)
- `llama-3.1-8b-instant` (faster, lighter, higher daily request cap)
- `mixtral-8x7b-32768` (for different use cases)

To change models, set `GROQ_MODEL` in your `.env` file.

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
- Prevents hitting Groq's free-tier limits
- Configurable limits per session
- Friendly error messages when limits exceeded

### Error Handling
- API key missing: Clear configuration error
- Rate limit exceeded: Friendly "try again in a moment" message
- API errors: Graceful degradation
- Network timeouts: Proper timeout handling

## Free Tier Benefits

### Cost
- **Completely Free**: No credit card required
- **No Per-Token Billing**: No ongoing costs
- **Generous Limits**: High daily request caps

### Performance
- **Fast Inference**: Groq's optimized infrastructure
- **Low Latency**: Quick response times
- **High Quality**: llama-3.3-70b model

### Ease of Use
- **Simple Setup**: No Docker containers or external services
- **OpenAI-Compatible**: Familiar API format
- **No Infrastructure**: Direct API calls

## Configuration Options

### Backend Configuration
- `GROQ_API_KEY`: Your Groq API key (required)
- `GROQ_MODEL`: Model to use (default: llama-3.3-70b-versatile)
- `GROQ_MAX_TOKENS`: Maximum response tokens (default: 1024)
- `CHAT_RATE_LIMIT_PER_MINUTE`: Rate limit per session (default: 10)

### Frontend Configuration
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

## Troubleshooting

### "Groq API key not configured"
- Add `GROQ_API_KEY` to your `.env` file
- Restart the backend server
- Verify the key is correct

### "I'm getting a lot of questions right now"
- Wait a moment before sending another message
- This is the rate limit being hit
- Adjust `CHAT_RATE_LIMIT_PER_MINUTE` in configuration

### "I'm having trouble connecting right now"
- Check your internet connection
- Verify your API key is valid
- Check Groq service status
- Ensure the API key has the correct permissions

### Slow responses
- Consider switching to `llama-3.1-8b-instant` for faster responses
- Check network latency
- Increase timeout in frontend (currently 30 seconds)

## Migration from Claude API

### What Changed
- **API Provider**: Anthropic Claude → Groq (free)
- **Model**: claude-3.5-sonnet → llama-3.3-70b-versatile
- **Cost**: Paid per-token → Completely free
- **Request Format**: Anthropic-specific → OpenAI-compatible

### What Stayed the Same
- **System Prompt**: Same grounding in NutriWasteAI context
- **Multi-turn Support**: Conversation history still maintained
- **Rate Limiting**: Similar mechanism for usage control
- **Frontend UI**: No changes to chat widget

### Benefits
- **No Cost**: Completely free to use
- **No Credit Card**: No billing setup required
- **Generous Limits**: High daily request caps
- **Fast Performance**: Optimized inference
- **Simple Setup**: No Docker or complex infrastructure

## Security Notes

- API key is stored in environment variables (never in code)
- API key is never exposed to the frontend
- Rate limiting prevents abuse
- No sensitive data sent with requests (only conversation history)

## Free Tier Limits

Groq's free tier offers:
- **Daily Requests**: Generous limits per API key
- **Tokens**: High token allowances
- **Speed**: Optimized inference
- **Models**: Access to multiple open-source models

Check the [Groq Console](https://console.groq.com/) for current specific limits.

## Model Comparison

### llama-3.3-70b-versatile (Default)
- **Quality**: High
- **Speed**: Fast
- **Use Case**: General-purpose conversations
- **Recommendation**: Best balance for most use cases

### llama-3.1-8b-instant
- **Quality**: Good
- **Speed**: Very fast
- **Use Case**: High-volume applications
- **Recommendation**: Use if hitting rate limits

## Future Enhancements

Potential improvements:
- Conversation persistence to database
- User-specific rate limits
- Streaming responses for real-time feel
- Model selection based on query type
- Conversation export functionality
- Analytics on common questions

## Support

For issues with:
- **Groq API**: Check [Groq Console](https://console.groq.com/)
- **Integration**: Review logs in backend terminal
- **Frontend**: Check browser console for errors

## Additional Resources

- [Groq Documentation](https://console.groq.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Llama 3 Models](https://llama.meta.com/)
