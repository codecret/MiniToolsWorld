"use client";

import { useCallback, useState } from "react";
import JSZip from "jszip/dist/jszip.min.js";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type GeneratedImage = {
  pageNumber: number;
  imageIndex?: number;
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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pdf/extract-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to process PDF");
      }

      const data = await response.json();

      if (data.success && data.images) {
        setImages(data.images);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while processing your PDF."
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    void handleFileChange(file);
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    const zip = new JSZip();

    for (const img of images) {
      const [header, data] = img.url.split(",");
      if (!data) continue;

      const isBase64 = /;base64$/i.test(header);

      if (isBase64) {
        const fileName = `page-${img.pageNumber}-image-${
          img.imageIndex || img.pageNumber
        }.webp`;
        zip.file(fileName, data, { base64: true });
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-pdf-images.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Extract PDF Images</CardTitle>
        <CardDescription>
          Easy to use app to extract all embedded images from PDF files.
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
            Extract embedded images from your PDF. All images are converted to
            WebP format for download.
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
                Extracted images ({images.length})
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                  Download all (.zip)
                </Button>
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
              {images.map((img, idx) => (
                <div
                  key={img.imageIndex || `${img.pageNumber}-${idx}`}
                  className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`Image from page ${img.pageNumber}${
                      img.imageIndex ? ` (${img.imageIndex})` : ""
                    }`}
                    className="h-64 w-full object-contain bg-neutral-100 dark:bg-neutral-900"
                  />
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <span>
                      Page {img.pageNumber}
                      {img.imageIndex ? ` • Image ${img.imageIndex}` : ""}
                    </span>
                    <a
                      href={img.url}
                      download={`page-${img.pageNumber}-image-${
                        img.imageIndex || img.pageNumber
                      }.webp`}
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
