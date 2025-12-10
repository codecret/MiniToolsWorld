# MiniToolsWorld

A full-stack application for PDF and image processing tools, with a Next.js frontend and Python FastAPI backend.

## Project Structure

```
MiniToolsWorld/
├── frontend/          # Next.js 16 App Router application
├── backend/           # Python FastAPI backend service
└── README.md          # This file
```

## Frontend

The frontend is a Next.js 16 application that provides web-based tools for PDF and image processing.

See [frontend/README.md](./frontend/README.md) for frontend-specific documentation.

### Quick Start (Frontend)

```bash
cd frontend
npm install
npm run dev
```

## Backend

The backend is a Python FastAPI service that handles PDF image extraction.

See [backend/README.md](./backend/README.md) for backend-specific documentation.

### Quick Start (Backend)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## Development

### Running Both Services

1. **Start the Python backend:**

   ```bash
   cd backend
   python main.py
   ```

   Backend runs on `http://localhost:8000`

2. **Start the Next.js frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

### Environment Variables

The frontend API route (`frontend/src/app/api/pdf/extract-images/route.ts`) uses the `PYTHON_BACKEND_URL` environment variable to connect to the backend. By default, it's set to `http://localhost:8000`.

To customize, create a `.env.local` file in the `frontend` directory:

```env
PYTHON_BACKEND_URL=http://localhost:8000
```

## Features

- **PDF Image Extraction**: Extract embedded images from PDF files and convert them to WebP format
- **Image → WebP**: Convert multiple images to WebP format with compression
