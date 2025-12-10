export default function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          PDF Image Extractor
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Extract PDF Images
        </h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Easy to use app to extract all embedded images from PDF files. All
          images are automatically converted to WebP format for easy download.
        </p>
      </section>
      <section>
        <PdfToWebpTool />
      </section>
    </div>
  );
}

import { PdfToWebpTool } from "../components/pdf-to-webp-tool";
