# PDF Image Extraction Backend

Python FastAPI backend for extracting embedded images from PDF files and converting them to WebP format.

## Setup

1. Create a virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### POST `/api/extract-images`

Extract embedded images from a PDF file.

**Request:**

- Content-Type: `multipart/form-data`
- Body: PDF file

**Response:**

```json
{
  "success": true,
  "images": [
    {
      "pageNumber": 1,
      "imageIndex": 1,
      "url": "data:image/webp;base64,..."
    }
  ],
  "totalImages": 1
}
```

**Note:** This endpoint extracts embedded images from the PDF, not page renders. If a PDF contains only text or vector graphics without embedded images, it will return an error.

### GET `/health`

Health check endpoint.

## Development

The backend uses:

- **FastAPI** - Modern Python web framework
- **PyMuPDF (fitz)** - PDF processing library
- **Pillow** - Image processing and WebP conversion
