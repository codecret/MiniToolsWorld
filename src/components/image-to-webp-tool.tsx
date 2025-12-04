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

type OptimizedImage = {
  name: string;
  url: string;
  originalSizeKb: number;
  optimizedSizeKb: number;
};

export function ImageToWebpTool() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<OptimizedImage[]>([]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setIsProcessing(true);
    setImages([]);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    try {
      const results: OptimizedImage[] = [];

      const fileArray = Array.from(files);

      for (let index = 0; index < fileArray.length; index++) {
        const file = fileArray[index];
        if (!allowedTypes.includes(file.type)) {
          // Skip unsupported files but keep going
          continue;
        }

        // Read file as data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        // Create an Image and draw it to a canvas
        const optimizedUrl = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const maxDimension = 1600; // simple downscale for optimization
            let { width, height } = img;

            if (width > height && width > maxDimension) {
              const ratio = maxDimension / width;
              width = maxDimension;
              height = Math.round(height * ratio);
            } else if (height > maxDimension) {
              const ratio = maxDimension / height;
              height = maxDimension;
              width = Math.round(width * ratio);
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Could not create canvas context"));
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            const webpUrl = canvas.toDataURL("image/webp", 0.8);
            resolve(webpUrl);
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = dataUrl;
        });

        const originalSizeKb = Math.round(file.size / 102.4) / 10; // 1 decimal
        const optimizedSizeKb =
          Math.round((optimizedUrl.length * (3 / 4)) / 102.4) / 10;

        const sequentialName = `${index + 1}.webp`;

        results.push({
          name: sequentialName,
          url: optimizedUrl,
          originalSizeKb,
          optimizedSizeKb,
        });
      }

      if (results.length === 0) {
        setError("No supported image files were found. Use JPG, PNG, or WebP.");
      }

      setImages(results);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while optimizing your images.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void handleFiles(event.target.files);
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    const zip = new JSZip();

    for (const img of images) {
      const [header, data] = img.url.split(",");
      if (!data) continue;

      const isBase64 = /;base64$/i.test(header);

      if (isBase64) {
        zip.file(img.name, data, { base64: true });
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "images-webp.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Images → WebP</CardTitle>
        <CardDescription>
          Drop in multiple JPG/PNG images and get optimized WebP versions back.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Choose images
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onInputChange}
            className="block w-full cursor-pointer rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-700 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500"
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            All compression and optimization runs in your browser. Your images
            never leave your device.
          </p>
        </div>

        {isProcessing && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Optimizing images… This can take a moment for large batches.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {images.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Optimized images ({images.length})
              </p>
              <div className="flex items-center gap-2">
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
              {images.map((img) => (
                <div
                  key={img.name}
                  className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="h-56 w-full bg-neutral-100 object-contain dark:bg-neutral-900"
                  />
                  <div className="space-y-1 px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" title={img.name}>
                        {img.name}
                      </span>
                      <a
                        href={img.url}
                        download={img.name}
                        className="shrink-0 font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Download
                      </a>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {img.originalSizeKb} kB → {img.optimizedSizeKb} kB
                    </p>
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
