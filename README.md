## Tools – PDF & Image to WebP

This is a small tools site built with **Next.js 16 App Router**, **TypeScript**, and **Tailwind**, providing fast, fully client-side utilities for converting files to **WebP**.

### Available tools

- **PDF → WebP** (`/`)

  - Upload a single PDF.
  - Each page is rendered in the browser using `pdfjs-dist`.
  - You get a list of **compressed WebP images**, one per page, with previews and individual download links.
  - All processing happens locally in your browser; the PDF is never uploaded to a server.

- **Images → WebP** (`/image-to-webp`)
  - Upload multiple **JPG / PNG / WebP** images at once.
  - Each image is downscaled (max dimension 1600px) and compressed to WebP.
  - Outputs are named sequentially: `1.webp`, `2.webp`, `3.webp`, ...
  - You can:
    - Download each image individually.
    - Or **Download all** as a single `.zip` archive (built client-side with `jszip`).

### Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **UI primitives**: Custom light-weight `Button` and `Card` components in a shadcn-style API
- **PDF rendering**: `pdfjs-dist`
- **Image optimization**: HTML Canvas API in the browser
- **Zip archive**: `jszip`

### Getting started

```bash
cd /Users/y7gn/Downloads/pdf-webp

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Then open the URL Next prints (usually `http://localhost:3000` or `http://localhost:3001`).

### Notes

- All heavy work (PDF page rendering, image compression, zipping) is done **client-side**.
- This means:
  - No file contents are sent to any backend.
  - Performance depends on the user’s machine and browser.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
