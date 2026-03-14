# MiniToolsWorld

A full-stack application for PDF and image processing tools, with a Next.js frontend and Python FastAPI backend.

## How to run

Run **both** the backend and frontend (in separate terminals). The frontend talks to the backend for PDF image extraction.

### 1. Backend (Python)

```bash
cd backend
python -m venv venv
```

**Windows (PowerShell or CMD):**

```bash
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**macOS / Linux:**

```bash
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Backend runs at **http://localhost:8000**

### 2. Frontend (Next.js)

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**. Open this in your browser.

---

## Project Structure

```
MiniToolsWorld/
├── frontend/          # Next.js 16 App Router application
├── backend/           # Python FastAPI backend service
└── README.md          # This file
```

## Frontend

Next.js 16 app for PDF and image tools. See [frontend/README.md](./frontend/README.md) for more.

## Backend

Python FastAPI service for PDF image extraction. See [backend/README.md](./backend/README.md) for more.

## Environment Variables

The frontend API route (`frontend/src/app/api/pdf/extract-images/route.ts`) uses the `PYTHON_BACKEND_URL` environment variable to connect to the backend. By default, it's set to `http://localhost:8000`.

To customize, create a `.env.local` file in the `frontend` directory:

```env
PYTHON_BACKEND_URL=http://localhost:8000
```

## Features

- **PDF Image Extraction**: Extract embedded images from PDF files and convert them to WebP format
- **Image → WebP**: Convert multiple images to WebP format with compression
