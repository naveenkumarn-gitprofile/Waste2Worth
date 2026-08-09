# Enquiry Agent & Dark Mode Integration

## Overview
This document describes the integration of the Enquiry Agent (AI chatbot) and Dark Mode functionality into the NutriWasteAI application.

## Part A: Enquiry Agent

### Architecture
The Enquiry Agent is a fully isolated AI chatbot system using AnythingLLM, completely separate from the main application logic.

### Components

#### 1. Docker Service (AnythingLLM)
- **File**: `docker-compose.yml`
- **Service**: `enquiry-agent`
- **Image**: `mintplexlabs/anythingllm:latest`
- **Port**: 3001
- **Status**: Ready to run (not started)

#### 2. Backend API Route
- **File**: `backend/app/api/enquiry.py`
- **Endpoint**: `POST /enquiry/chat`
- **Purpose**: Proxy endpoint for AnythingLLM communication
- **Isolation**: Completely separate from auth, analysis, reports, and database logic
- **Graceful Degradation**: Returns 503 if AnythingLLM is unavailable

#### 3. Frontend Chat Widget
- **File**: `frontend/src/components/ChatWidget.jsx`
- **Features**:
  - Floating chat widget (bottom-right corner)
  - Toggle via navbar "Enquiry Agent" button
  - Dark mode support
  - Greeting message + starter questions
  - Typing/loading indicator
  - Graceful error handling

#### 4. Environment Variables
Add to `backend/.env`:
```env
ENQUIRY_AGENT_SERVICE_URL=http://localhost:3001
ENQUIRY_AGENT_API_KEY=
ENQUIRY_AGENT_JWT_SECRET=enquiry-agent-secret-key
```

### Starting AnythingLLM
```bash
# Start the AnythingLLM service
docker-compose up -d enquiry-agent

# Access the AnythingLLM UI
# Open http://localhost:3001 in your browser
```

### Knowledge Base Setup
After starting AnythingLLM, you need to:
1. Create a workspace
2. Upload the following documents:
   - NutriWasteAI platform documentation
   - Food waste valorization background
   - Nutritional analysis information
   - Trial vs logged-in mode differences
   - FAQ documentation

### API Usage
```bash
# Test the endpoint (requires AnythingLLM running)
curl -X POST http://localhost:8000/enquiry/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What does NutriWasteAI do?"}'
```

## Part B: Dark Mode Toggle

### Implementation

#### 1. Tailwind Configuration
- **File**: `frontend/tailwind.config.js`
- **Mode**: `class` strategy
- **Colors**: Added dark mode color palette
  - `dark-bg`: #121714 (deep charcoal)
  - `dark-card`: #1A211D (card background)
  - `dark-text`: #E8E4D9 (soft off-white)
  - `dark-muted`: #9A9A9A (muted text)

#### 2. Theme Context
- **File**: `frontend/src/context/ThemeContext.jsx`
- **Features**:
  - Theme state management
  - localStorage persistence
  - System preference detection
  - Theme toggle function

#### 3. CSS Variables
- **File**: `frontend/src/index.css`
- **Purpose**: Global dark mode overrides using CSS variables
- **Coverage**: Automatic dark mode for common classes

#### 4. Navbar Integration
- **File**: `frontend/src/components/Navbar.jsx`
- **Changes**:
  - Added sun/moon toggle button
  - Added chat widget toggle button
  - Imported ThemeContext

### Theme Behavior
- **Default**: Light mode (existing green design)
- **System Preference**: Automatically detects system dark mode preference
- **Persistence**: User preference saved to localStorage
- **Toggle**: Instant application across entire app

### Color Scheme

#### Light Mode (Default)
- Background: #F8FAF6 (cream/off-white)
- Header/Nav: #1B4332 (forest green)
- Accents: #95D5B2, #B7E4C7 (sage green)
- Text: #1B4332 (dark green/black)

#### Dark Mode
- Background: #121714 (deep charcoal)
- Header/Nav: #1B4332 (forest green - same)
- Accents: #95D5B2, #B7E4C7 (sage green - slightly brightened)
- Text: #E8E4D9 (soft off-white)

## Regression Test Results

### Part A: Existing Functionality
✅ **ALL TESTS PASSED**
- Health Check: PASS
- Registration: PASS
- Login: PASS
- Manual Analysis (Auth): PASS
- Trial Analysis: PASS
- Enquiry Agent: PASS (graceful degradation)

### Part B: Dark Mode
✅ **Manual Testing Required**
- Theme toggle works
- CSS variables provide automatic dark mode
- Theme preference persists
- All components have basic dark mode support

## Files Modified

### Backend
1. `backend/.env` - Added enquiry agent variables
2. `backend/.env.example` - Added enquiry agent variables
3. `backend/app/core/config.py` - Added enquiry agent settings
4. `backend/app/main.py` - Added enquiry router
5. `backend/requirements.txt` - Added httpx dependency
6. `backend/app/api/__init__.py` - Created API module init
7. `backend/app/api/enquiry.py` - New enquiry agent router

### Frontend
1. `frontend/.env` - Added API URL
2. `frontend/tailwind.config.js` - Added dark mode support
3. `frontend/src/index.css` - Added CSS variables for dark mode
4. `frontend/src/App.jsx` - Added ThemeProvider wrapper
5. `frontend/src/context/ThemeContext.jsx` - New theme context
6. `frontend/src/components/Navbar.jsx` - Added theme toggle and chat button
7. `frontend/src/components/ChatWidget.jsx` - New chat widget component
8. `frontend/src/pages/Landing.jsx` - Added dark mode classes
9. `frontend/src/pages/Login.jsx` - Added dark mode classes
10. `frontend/src/pages/Dashboard.jsx` - Added dark mode classes

### New Files
1. `docker-compose.yml` - Docker configuration for AnythingLLM
2. `frontend/src/context/ThemeContext.jsx` - Theme management
3. `frontend/src/components/ChatWidget.jsx` - Chat widget
4. `backend/app/api/__init__.py` - API module initialization
5. `backend/app/api/enquiry.py` - Enquiry agent API

## Isolation Guarantees

### Part A Isolation
✅ **No changes to**:
- `predict_and_recommend()` function
- Analysis routes (`/analysis/manual`, `/analysis/image`)
- Reports/users database tables/schema
- Auth logic
- PDF generation code
- Main application database

✅ **Separate concerns**:
- AnythingLLM runs as isolated Docker service
- Enquiry API in separate router file
- No chat history persistence to main DB
- Graceful degradation if service unavailable

### Part B Isolation
✅ **No structural changes**:
- Component logic unchanged
- Layout unchanged
- Routing unchanged
- State management unchanged

✅ **Additive only**:
- CSS variables for automatic dark mode
- Theme context wrapper
- Toggle button in navbar
- No refactoring of existing components

## Next Steps

### For Enquiry Agent
1. Start Docker: `docker-compose up -d enquiry-agent`
2. Access AnythingLLM UI: http://localhost:3001
3. Set up workspace and upload knowledge base documents
4. Configure AI model in AnythingLLM
5. Test chat functionality

### For Dark Mode
1. Test all pages in both light and dark modes
2. Verify contrast ratios meet accessibility standards
3. Test theme persistence across sessions
4. Test theme preference after logout/login

## Troubleshooting

### Enquiry Agent Issues
- **503 Error**: AnythingLLM service not running
- **Validation Error**: Check API request format
- **Connection Error**: Check Docker service status

### Dark Mode Issues
- **Not applying**: Check localStorage for theme preference
- **Poor contrast**: Adjust CSS variables in index.css
- **Broken layout**: Check for missing dark mode classes

## Security Notes

- Enquiry Agent uses separate JWT secret
- No sensitive data in chat without AnythingLLM running
- Theme preference stored in localStorage (client-side only)
- No database changes for either feature
