export default function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Tools
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          PDF utilities that run in your browser.
        </h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Start with the PDF → WebP converter. Drop in a PDF and download each
          page as a compressed WebP image. No uploads, no waiting, just fast
          processing on your device.
        </p>
      </section>
      <section>
        {/* @ts-expect-error Server Component importing client component is allowed in Next App Router */}
        <PdfToWebpTool />
      </section>
    </div>
  );
}

import { PdfToWebpTool } from "../components/pdf-to-webp-tool";
