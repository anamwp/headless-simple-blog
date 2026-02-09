# Headless Simple Blog

A modern headless blog built with [Next.js](https://nextjs.org) 16, [React](https://react.dev) 19, and [TailwindCSS](https://tailwindcss.com). This application decouples the frontend from the backend, allowing you to manage content via a headless CMS while displaying it through a fast, responsive Next.js interface.

## Features

- **Headless Architecture**: Separates content management from presentation
- **Server-Side Rendering**: Fast page loads with Next.js SSR capabilities
- **Responsive Design**: Built with TailwindCSS for mobile-first styling
- **User Authentication**: Login and user management support
- **Comments System**: Interactive comment functionality
- **Category & Tag Support**: Organize posts by categories and tags
- **Dynamic Routing**: URL-based post, category, and tag pages

## Project Structure

```
├── app/              # Next.js app directory (layouts, global styles)
├── pages/            # API routes and legacy pages
├── components/       # Reusable React components
│   ├── Comment.js
│   ├── CommentForm.js
│   ├── CurrentUser.js
│   ├── Layout.js
│   ├── Login.js
│   ├── LoginMenu.js
│   ├── UserData.js
│   └── WPMenu.js
├── lib/              # Utility functions and API calls
│   └── api.js
├── public/           # Static assets
└── styles/           # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

### Build & Production

Build for production:

```bash
npm run build
npm start
```

## Technologies

- **Framework**: [Next.js 16](https://nextjs.org)
- **UI Library**: [React 19](https://react.dev)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com)
- **HTTP Client**: [Axios](https://axios-http.com)
- **Linting**: [ESLint 10](https://eslint.org)
- **Language**: [TypeScript 5](https://www.typescriptlang.org)

## Configuration

- **TypeScript Config**: `tsconfig.json`
- **Next.js Config**: `next.config.ts`
- **TailwindCSS Config**: `tailwind.config.js`
- **PostCSS Config**: `postcss.config.js`

## Deployment

Deploy on [Vercel](https://vercel.com) for the best experience with Next.js:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Deploy with a single click

For other hosting options, check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
