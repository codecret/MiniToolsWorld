"""
FastAPI backend for PDF image extraction
Extracts images from PDF files and converts them to WebP format
"""
import os
import tempfile
import base64
from pathlib import Path
from typing import List, Dict
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
from PIL import Image
import io

app = FastAPI(title="PDF Image Extractor")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_images_from_pdf(pdf_path: str) -> List[Dict[str, any]]:
    """
    Extract embedded images from PDF and convert to WebP format.
    Returns a list of dictionaries with page number, image index, and base64-encoded WebP image.
    """
    images = []
    image_index = 0
    seen_xrefs = set()  # Track extracted images to avoid duplicates
    
    try:
        # Open PDF with PyMuPDF
        pdf_document = fitz.open(pdf_path)
        
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            
            # Get list of images embedded in this page
            # get_images(full=True) returns embedded image objects, NOT page renders
            # This extracts actual image files embedded in the PDF (photos, logos, etc.)
            # NOT the rendered appearance of the page
            image_list = page.get_images(full=True)
            
            if not image_list:
                continue  # Skip pages with no images
            
            for img_index, img_info in enumerate(image_list):
                try:
                    # Get image by xref (image reference number)
                    xref = img_info[0]
                    
                    # Skip if we've already extracted this image (can appear on multiple pages)
                    if xref in seen_xrefs:
                        continue
                    
                    seen_xrefs.add(xref)
                    
                    # Extract the actual image data
                    base_image = pdf_document.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    
                    # Skip if image is too small (likely not a real embedded image)
                    if len(image_bytes) < 100:  # Less than 100 bytes is suspiciously small
                        continue
                    
                    # Open image with PIL
                    img_pil = Image.open(io.BytesIO(image_bytes))
                    
                    # Skip very small images (likely icons or decorative elements)
                    if img_pil.width < 10 or img_pil.height < 10:
                        continue
                    
                    # Convert RGBA to RGB if necessary (WebP supports both, but RGB is smaller)
                    if img_pil.mode == "RGBA":
                        # Create white background for transparency
                        rgb_img = Image.new("RGB", img_pil.size, (255, 255, 255))
                        rgb_img.paste(img_pil, mask=img_pil.split()[3])  # Use alpha channel as mask
                        img_pil = rgb_img
                    elif img_pil.mode == "P":  # Palette mode
                        img_pil = img_pil.convert("RGB")
                    elif img_pil.mode not in ("RGB", "L"):
                        img_pil = img_pil.convert("RGB")
                    
                    # Convert to WebP
                    webp_buffer = io.BytesIO()
                    img_pil.save(webp_buffer, format="WEBP", quality=85, method=6)
                    webp_buffer.seek(0)
                    
                    # Encode to base64
                    webp_base64 = base64.b64encode(webp_buffer.read()).decode('utf-8')
                    data_url = f"data:image/webp;base64,{webp_base64}"
                    
                    image_index += 1
                    images.append({
                        "pageNumber": page_num + 1,
                        "imageIndex": image_index,
                        "url": data_url
                    })
                except Exception as e:
                    # Skip images that can't be processed
                    print(f"Warning: Could not extract image {img_index} from page {page_num + 1}: {str(e)}")
                    continue
        
        pdf_document.close()
        
    except Exception as e:
        raise Exception(f"Error processing PDF: {str(e)}")
    
    if not images:
        raise Exception("No embedded images found in this PDF. The PDF may only contain text or vector graphics.")
    
    return images


@app.post("/api/extract-images")
async def extract_images(file: UploadFile = File(...)):
    """
    Extract embedded images from uploaded PDF file.
    Returns JSON with list of extracted images in WebP format.
    """
    # Validate file type
    if not file.content_type or file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        try:
            # Save uploaded file to temporary location
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
            
            # Extract images
            images = extract_images_from_pdf(tmp_file_path)
            
            return JSONResponse(content={
                "success": True,
                "images": images,
                "totalImages": len(images)
            })
            
        except Exception as e:
            error_message = str(e)
            status_code = 400 if "No embedded images found" in error_message else 500
            raise HTTPException(status_code=status_code, detail=error_message)
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.post("/api/debug-pdf")
async def debug_pdf(file: UploadFile = File(...)):
    """
    Debug endpoint to see what images are found in a PDF.
    """
    if not file.content_type or file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        try:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
            
            pdf_document = fitz.open(tmp_file_path)
            debug_info = {
                "totalPages": len(pdf_document),
                "pages": []
            }
            
            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]
                image_list = page.get_images(full=True)
                page_info = {
                    "pageNumber": page_num + 1,
                    "imageCount": len(image_list),
                    "images": []
                }
                
                for img_info in image_list:
                    xref = img_info[0]
                    try:
                        base_image = pdf_document.extract_image(xref)
                        page_info["images"].append({
                            "xref": xref,
                            "ext": base_image["ext"],
                            "size": len(base_image["image"]),
                            "width": base_image.get("width", "unknown"),
                            "height": base_image.get("height", "unknown"),
                        })
                    except:
                        pass
                
                debug_info["pages"].append(page_info)
            
            pdf_document.close()
            return JSONResponse(content=debug_info)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

