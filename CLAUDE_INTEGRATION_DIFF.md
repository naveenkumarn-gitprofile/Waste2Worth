# Claude API Integration - Change Summary

## Overview
This document summarizes the changes made to replace the AnythingLLM-based Enquiry Agent with a direct Claude API integration.

## Files Modified

### Backend Configuration
1. **backend/.env** - Removed AnythingLLM variables, added Claude API configuration
2. **backend/.env.example** - Updated with Claude API variables
3. **backend/app/core/config.py** - Replaced AnythingLLM settings with Claude API settings
4. **backend/requirements.txt** - Added anthropic==0.18.0 dependency

### Backend API
5. **backend/app/api/enquiry.py** - Complete rewrite for Claude API integration
   - Removed AnythingLLM proxy logic
   - Added direct Anthropic Claude API calls
   - Implemented multi-turn conversation support
   - Added rate limiting
   - Added comprehensive error handling
   - Added system prompt for context grounding

### Frontend
6. **frontend/src/components/ChatWidget.jsx** - Updated for general-purpose chat
   - Removed FAQ engine dependency
   - Added conversation history support
   - Updated starter questions to be more general
   - Changed greeting message
   - Improved error handling

### Removed Files
- **frontend/src/services/faqEngine.js** - Local FAQ fallback engine (no longer needed)
- **docker-compose.yml** - AnythingLLM service configuration (replaced with simple comment)

### Documentation
7. **README.md** - Updated with Enquiry Agent section and Claude API setup
8. **ENQUIRY_AGENT.md** - Previous AnythingLLM documentation (kept for reference)
9. **ENQUIRY_AGENT_CLAUDE.md** - New Claude API integration documentation

## New Files Created

### Backend
- **backend/app/api/__init__.py** - API module initialization
- **backend/app/api/enquiry.py** - Claude API integration endpoint

### Frontend
- **frontend/src/components/ChatWidget.jsx** - General-purpose chat widget
- **frontend/src/context/ThemeContext.jsx** - Theme management context

### Configuration
- **docker-compose.yml** - Now contains only a comment about Claude integration

## Key Changes

### Backend API Endpoint
**Before**: Proxy to AnythingLLM service
```python
@router.post("/chat")
async def chat_with_agent(message: str):
    # Called AnythingLLM REST API
    response = await client.post(f"{enquiry_agent_url}/api/v1/chat", ...)
```

**After**: Direct Claude API call with conversation history
```python
@router.post("/chat")
async def chat_with_claude(request: ChatRequest):
    # Direct Anthropic Claude API call
    response = client.messages.create(
        model=settings.CLAUDE_MODEL,
        system=SYSTEM_PROMPT,
        messages=conversation_history
    )
```

### Frontend Chat Widget
**Before**: FAQ engine + backend fallback
```javascript
const localAnswer = findFAQAnswer(userMessage);
if (localAnswer) {
    return localAnswer;
} else {
    // Try backend API
}
```

**After**: Direct backend API with conversation history
```javascript
const conversationHistory = messages.map(msg => ({
    role: msg.role,
    content: msg.content
}));
const response = await fetch('/enquiry/chat', {
    body: JSON.stringify({ 
        message: userMessage,
        conversation_history: conversationHistory
    })
});
```

### System Prompt
**New Feature**: System prompt defined in backend/app/api/enquiry.py
```python
SYSTEM_PROMPT = """You are the Enquiry Agent for NutriWasteAI...
Answer any question the user has — about the platform, food science, 
nutrition, sustainability, or general topics..."""
```

This is the single place to adjust the assistant's persona and context grounding.

## Architecture Changes

### Before (AnythingLLM)
```
Frontend → Backend → AnythingLLM Docker → Claude/Other LLM
```

### After (Direct Claude API)
```
Frontend → Backend → Claude API (direct)
```

## Benefits of New Architecture

1. **Simpler Setup**: No Docker service to manage
2. **General-Purpose**: Can handle any question, not just platform-specific
3. **Multi-Turn Memory**: Better conversation context
4. **Reduced Infrastructure**: Fewer moving parts
5. **Cost Control**: Built-in rate limiting
6. **Easier Maintenance**: Direct API integration

## Configuration Changes

### Environment Variables

**Removed**:
- `ENQUIRY_AGENT_SERVICE_URL`
- `ENQUIRY_AGENT_API_KEY`
- `ENQUIRY_AGENT_JWT_SECRET`

**Added**:
- `ANTHROPIC_API_KEY` (required)
- `CLAUDE_MODEL` (default: claude-3-5-sonnet-20241022)
- `CLAUDE_MAX_TOKENS` (default: 1024)
- `CHAT_RATE_LIMIT_PER_MINUTE` (default: 10)

## Functionality Changes

### Chatbot Capabilities
**Before**: 
- Platform-specific FAQ answers only
- No multi-turn conversation memory
- Restricted answer set

**After**:
- General-purpose conversational AI
- Multi-turn conversation support
- Can answer any question (platform + general knowledge)
- Context-aware responses

### Error Handling
**Before**: 
- Generic "service unavailable" messages
- No rate limiting

**After**:
- Specific error messages (API key missing, rate limit, etc.)
- Built-in rate limiting
- Timeout handling
- Graceful degradation

## Testing Required

### Chatbot Functionality
1. Test with platform-specific questions
2. Test with general knowledge questions
3. Test multi-turn conversations
4. Test rate limiting
5. Test error handling (missing API key, etc.)

### Regression Tests
1. Manual analysis (trial and logged-in)
2. Image analysis (trial and logged-in)
3. Authentication (login/registration)
4. History/reports page
5. PDF generation
6. Theme switching
7. All existing functionality

## Migration Notes

### For Users
1. Get Claude API key from Anthropic Console
2. Add `ANTHROPIC_API_KEY` to backend/.env
3. Restart backend server
4. No changes to frontend or other features

### For Developers
1. Review system prompt in backend/app/api/enquiry.py
2. Adjust rate limits if needed
3. Monitor API costs in Anthropic Console
4. Consider conversation persistence for future

## Backward Compatibility

- **Breaking Change**: Requires Claude API key (AnythingLLM no longer works)
- **Compatible**: All other NutriWasteAI features unchanged
- **UI**: Chat widget remains the same (different "brain")
- **API**: Same endpoint `/enquiry/chat` (different implementation)

## Security Considerations

- API key stored in environment variables (never in code)
- API key never exposed to frontend
- Rate limiting prevents cost overruns
- No sensitive data in conversation history
- System prompt provides appropriate context without data leakage

## Performance Considerations

- API calls are synchronous (consider streaming for future)
- 30-second timeout on frontend
- Rate limiting prevents abuse
- Conversation history sent with each request (consider optimization for long conversations)

## Future Enhancements

Potential improvements:
- Streaming responses for real-time feel
- Conversation persistence to database
- User-specific rate limits
- Analytics on common questions
- Multiple model support (GPT-4o fallback)
- Conversation export functionality
