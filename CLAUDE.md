# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

文灵AI (XHS Card AI) — an AI-powered Xiaohongshu (Little Red Book) content card generator. Users input topics or reference posts, AI generates styled content, and the app exports it as downloadable card images. Chinese-only UI, deployed on Vercel at xhscard.top.

## Commands

```bash
yarn dev          # Start dev server (Next.js)
yarn build        # Production build
yarn start        # Start production server
yarn lint         # ESLint via next lint
```

No test framework is configured.

## Architecture

**Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Yarn 1.22

### Three Editor Modes

The app has three content generation modes, controlled by `EditorState.template`:

1. **AI Inspiration (`'ai'`)** — User inputs a topic, `/api/generate/ai-card` streams original XHS-style content via OpenRouter (GPT-4o-mini)
2. **Hot Post Rewrite (`'hot_post'`)** — User pastes reference content + keywords + style preference, `/api/generate/hot-post` streams a rewritten version
3. **Image Text (`'image_text'`)** — User searches keywords, `/api/generate/image-card` fetches images from Unsplash API

### Key Component Hierarchy

```
RootLayout (app/layout.tsx)
└── Page (app/page.tsx) — landing page with integrated editor
    └── XhsEditor — core orchestrator (~1063 lines), manages all state
        ├── AIContentEditor — AI generation UI + streaming
        ├── HotPostEditor — rewrite UI + streaming
        ├── ImageTextEditor — Unsplash image search
        └── MarkdownCard (forwardRef) — preview/edit card with markdown rendering
```

`app/editor/page.tsx` renders the same `XhsEditor` as a standalone editor page.

### API Routes (`app/api/generate/`)

- **ai-card** and **hot-post**: Edge runtime, SSE streaming via custom `TransformStream` parsing OpenRouter responses. Returns `{ content, done, isPartial }` chunks.
- **image-card**: Node.js runtime, returns `{ url, downloadUrl, author }` from Unsplash. Tracks recently-used images to avoid duplicates.

### Image Export Pipeline

`XhsEditor.handleDownload()` uses html2canvas with a multi-step process:
1. Clone target DOM element
2. `sanitizeCloneForHtml2Canvas()` — strip unsupported CSS (oklch/oklab colors)
3. Apply font/styling fixes, format lists
4. Render at 2x scale
5. Mobile: falls back to Web Share API or creates download link

### State Shape

```typescript
// app/types/editor.ts
EditorState {
  template: 'ai' | 'hot_post' | 'image_text'
  title: string
  font: string              // Google Font family name
  fontSize: string          // '14px' to '20px'
  backgroundColor: { from: string; to: string }  // gradient
  sections: Section[]       // each has id (uuid), title, content, optional imageUrl
}
```

### Environment Variables

- `OPENROUTER_API_KEY` — AI generation (OpenRouter, GPT-4o-mini)
- `UNSPLASH_ACCESS_KEY` — Image search
- `DEEPSEEK_API_KEY` — Legacy, no longer actively used
- `FAL_KEY` — Present but not actively used in current code

### Styling Patterns

- Tailwind utility classes throughout, with `@tailwindcss/typography` plugin
- Glassmorphism: `backdrop-blur-sm bg-white/60`
- Gradient backgrounds on sections
- Global animations in `app/globals.css` (slideIn/slideOut)
- Toast notifications via vanilla DOM manipulation (`app/utils/toast.ts`)

### Analytics

Dual tracking: Vercel Analytics (component in layout) + Umami (script tag). Custom events tracked via `app/hooks/useAnalytics.ts`.

### Fonts

Chinese fonts loaded via Google Fonts CDN. Two categories defined in XhsEditor: 中文简约 (Source Han Sans/Serif, Alibaba PuHui, LXGW WenKai, KaiTi) and 手写风格 (Ma Shan Zheng, Liu Jian Mao Cao, Zhi Mang Xing, Caveat, Dancing Script).

### Routing

- `/` — Landing page with editor
- `/editor` — Standalone editor
- `/zh` and `/zh/*` — 301 redirect to `/` (legacy locale prefix removal in next.config.js)
