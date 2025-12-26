This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
1. install the packages needed for the repo:
    ```bash
    npm install
    ```
2. Copy the environment config file.
    ```bash
    cp .env.example .env
    ```
    **Note:** Make sure the backend service is running on `http://localhost:8080` (see backend setup guide).

3. run the development server:

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

## Features

### Voice Changer

The frontend includes a Voice Changer page that allows users to convert audio files to different voices using ElevenLabs Speech-to-Speech API.

**Route**: `/voice`

Features:
- Upload audio files (mp3, wav, m4a, etc.)
- Convert to different voices
- Adjustable parameters (style, stability, noise removal)
- Preview original and converted audio
- Download converted audio files

For backend API documentation, see the backend [README](../terriyaki-go/README.md) and [Voice Changer docs](../terriyaki-go/docs/VOICE_CHANGER.md).
