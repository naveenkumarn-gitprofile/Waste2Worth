# NutriWasteAI

An AI-powered platform for food-waste valorization, nutritional assessment, and value-added product recommendation. This full-stack web application supports both manual entry and image-based analysis of food waste samples, providing nutritional composition analysis and product recommendations.

## Features

- **Dual Analysis Modes**: Manual entry and image capture for food waste samples
- **AI-Powered Analysis**: Nutritional composition estimation and value-added product recommendations
- **User Authentication**: JWT-based authentication with secure password hashing
- **Trial Mode**: Explore the platform without registration (limited features)
- **Report Management**: Save analysis history, view detailed reports, and download PDF exports
- **Responsive Design**: Modern, green-themed UI built with React and Tailwind CSS
- **SDG Alignment**: Supports UN Sustainable Development Goals 2, 9, and 12

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: SQLAlchemy + Alembic migrations
- **Authentication**: JWT with bcrypt password hashing
- **PDF Generation**: ReportLab
- **File Upload**: Python-multipart

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

## Project Structure

```
Waste2Worth MTP/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints (auth, analysis, reports)
│   │   ├── core/          # Configuration, database, security
│   │   ├── models/        # SQLAlchemy models
│   │   ├── services/      # Business logic (ML predictor)
│   │   └── main.py        # FastAPI application entry point
│   ├── alembic/           # Database migrations
│   ├── uploads/           # Uploaded images
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── App.jsx        # Main React component
│   │   └── main.jsx       # React entry point
│   ├── tailwind.config.js # Tailwind configuration
│   └── package.json      # Node dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **npm**: 7 or higher

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   DATABASE_URL=sqlite:///./nutriwaste.db
   JWT_SECRET_KEY=your-secret-key-change-this-in-production
   JWT_ALGORITHM=HS256
   JWT_EXPIRE_MINUTES=60
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

5. **Run the backend server**:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## Running the Application

### Development Mode

1. **Start the backend** (in one terminal):
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

### Production Mode

For production deployment:

1. **Backend**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run build
   # Serve the dist/ folder with nginx or another web server
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token
- `GET /auth/me` - Get current user info

### Analysis
- `POST /analysis/manual` - Submit manual entry analysis
- `POST /analysis/image` - Submit image-based analysis

### Reports
- `GET /reports/` - Get user's analysis history
- `GET /reports/{id}` - Get specific report details
- `GET /reports/{id}/pdf` - Download PDF report

### Enquiry Agent
- `POST /enquiry/chat` - General-purpose conversational chatbot powered by Claude API

## Enquiry Agent

The NutriWasteAI Enquiry Agent is a general-purpose conversational chatbot powered by **Groq's free API**. It can handle questions about the platform, food science, nutrition, sustainability, or general topics.

### Setup

1. **Create a free account** at [Groq Console](https://console.groq.com/) (no credit card required)
2. **Generate an API key** from the console
3. **Add to backend/.env**:
   ```env
   GROQ_API_KEY=your-groq-api-key-here
   ```
4. **Restart the backend server**

### Features
- **Free to Use**: No credit card required, generous free-tier limits
- **General-Purpose**: Handles platform-specific and general knowledge questions
- **Multi-Turn Memory**: Maintains conversation context within a session
- **Fast Responses**: Uses Groq's optimized inference with llama-3.3-70b-versatile
- **Rate Limiting**: Configurable limits to control usage
- **System Prompt**: Grounded in NutriWasteAI context while remaining flexible

### Usage
Click the chat icon in the navbar to open the floating chat widget. The chatbot can answer questions about:
- How NutriWasteAI works
- Food waste valorization
- Nutritional analysis
- Sustainability topics
- General knowledge questions

### Free Tier Limits
- **Model**: llama-3.3-70b-versatile (default, can be changed)
- **Requests**: Generous daily request limits
- **Cost**: Completely free, no per-token billing
- **Speed**: Fast inference times via Groq's optimized infrastructure

For detailed configuration and troubleshooting, see `ENQUIRY_AGENT_GROQ.md`.

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `hashed_password` - Bcrypt hashed password
- `name` - User's name (optional)
- `created_at` - Timestamp

### Reports Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `sample_name` - Name of the sample
- `source_type` - Type of food waste
- `input_method` - "manual" or "image"
- `image_path` - Path to uploaded image (optional)
- Nutrient values (protein, fat, fibre, carbohydrate, ash, moisture, energy)
- `composition` - JSON field for full composition data
- `recommended_products` - JSON field for product recommendations
- `source_reference` - Academic/reference citation
- `created_at` - Timestamp

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./nutriwaste.db` |
| `JWT_SECRET_KEY` | Secret key for JWT token generation | (change in production) |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | JWT token expiration time | `60` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:3000` |
| `GROQ_API_KEY` | Groq API key for Enquiry Agent chatbot (free) | (required for chatbot) |
| `GROQ_MODEL` | Groq model to use | `llama-3.3-70b-versatile` |
| `GROQ_MAX_TOKENS` | Maximum response tokens | `1024` |
| `CHAT_RATE_LIMIT_PER_MINUTE` | Rate limit for chatbot | `10` |

## ML Model Integration

The application currently uses a mock ML predictor that returns fixed sample data. To integrate a real trained model:

1. **Navigate to** `backend/app/services/ml_predictor.py`
2. **Replace the `predict_and_recommend()` function** with your model inference logic
3. **Maintain the same function signature and return structure**

See `MODEL_INTEGRATION.md` for detailed integration instructions.

## Features Overview

### Landing Page
- Hero section explaining the platform
- SDG information (Goals 2, 9, 12)
- "Get Started" and "Try Without Login" options

### Authentication
- Email/password registration and login
- Secure password hashing with bcrypt
- JWT token-based authentication
- Session persistence

### Trial Mode
- Full analysis access without registration
- View results and recommendations
- **Restricted**: Cannot save reports or download PDFs
- Persistent login prompts

### Dashboard
- Summary cards (total analyses, recent reports)
- Quick access to manual and image analysis
- Navigation to history and profile

### Analysis Pages
- **Manual Entry**: Form with sample details and optional nutrient values
- **Image Capture**: Camera access or file upload with preview
- Real-time validation and error handling

### Results Page
- Nutritional composition table
- Value-added product recommendations with justifications
- PDF download (logged-in users only)
- Save to history (logged-in users only)

### History & Reports
- Searchable list of past analyses
- Detailed report view
- PDF export functionality
- Date and source type filtering

## Development Notes

- The backend uses SQLite for development; switch to PostgreSQL for production
- Images are stored locally in the `uploads/` directory
- JWT tokens are stored in localStorage for simplicity
- The mock ML predictor can be replaced without modifying other components
- All API endpoints include proper error handling and validation

## Contributing

This is a demonstration project. For production use, consider:
- Implementing proper email verification
- Adding rate limiting
- Using cloud storage for images
- Implementing proper logging and monitoring
- Adding comprehensive test coverage
- Setting up CI/CD pipelines

## License

This project is part of the Waste2Worth MTP initiative.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
