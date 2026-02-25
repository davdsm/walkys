# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## PocketBase schema (Backoffice)

The backoffice expects the following PocketBase collections and fields. Configure them in the PocketBase admin if missing.

| Collection   | Required fields |
| ------------ | ---------------- |
| **products** | `media_hover` (file, single, image or video); `media_360` (file, multiple, images for 360° viewer); `media_gallery` (file, multiple, gallery images/videos); `sizes` (relation, multiple, to `sizes` collection). |
| **category** | `hover` (file, single, image or video) — shown on category hover. |
| **sizes**    | Must exist with at least `number`; products link to it via the `sizes` relation. |
| **Homepage** | For page editor: relation field(s) for `products` (single or multiple) and `categories` (multiple) on section records. |
| **translations** | No schema change; already used. |

---

Built with ❤️ using React Router.
