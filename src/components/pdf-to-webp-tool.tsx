'use client';

import { useCallback, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

// Configure pdf.js worker (served from the pdfjs-dist package)
// @ts-expect-error pdfjs worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.mjs`;

type GeneratedImage = {
  pageNumber: number;
  url: string;
};

export function PdfToWebpTool() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // @ts-expect-error getDocument types are not perfect in pdfjs-dist
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const generated: GeneratedImage[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        // eslint-disable-next-line no-await-in-loop
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 }); // higher scale = better quality

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not create canvas context.");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // eslint-disable-next-line no-await-in-loop
        await page.render({ canvasContext: context, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/webp", 0.8); // 0.8 = quality

        generated.push({
          pageNumber,
          url: dataUrl,
        });
      }

      setImages(generated);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while processing your PDF.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    void handleFileChange(file);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>PDF → WebP Images</CardTitle>
        <CardDescription>
          Upload a PDF and get each page back as a compressed WebP image.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Choose a PDF file
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="block w-full cursor-pointer rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-700 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500"
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            We process the PDF in your browser. Your file never leaves your
            device.
          </p>
        </div>

        {isProcessing && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Processing PDF… This can take a moment for large files.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {images.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Generated images
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImages([]);
                    setError(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {images.map((img) => (
                <div
                  key={img.pageNumber}
                  className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`Page ${img.pageNumber}`}
                    className="h-64 w-full object-contain bg-neutral-100 dark:bg-neutral-900"
                  />
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <span>Page {img.pageNumber}</span>
                    <a
                      href={img.url}
                      download={`page-${img.pageNumber}.webp`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


