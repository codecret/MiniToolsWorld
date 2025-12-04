import { ImageToWebpTool } from "../../components/image-to-webp-tool";

export default function ImageToWebpPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Tools
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Compress images to WebP.
        </h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Upload multiple JPG or PNG files and get optimized WebP images back.
          Everything runs locally in your browser, so your images stay private.
        </p>
      </section>
      <section>
        {/* Client component lives entirely in the browser */}
        <ImageToWebpTool />
      </section>
    </div>
  );
}
