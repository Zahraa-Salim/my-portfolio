# Zahraa Salim – Developer Portfolio

A modern, responsive developer portfolio built with **React**, **Vite**, and **Tailwind CSS**. It showcases projects, technical skills, and professional profile — with live data fetched from GitHub and pre-generated site screenshots.

## Overview

The portfolio dynamically loads GitHub repositories and presents them in a clean, professional interface. It features a **home page** with a project preview and a dedicated **projects page** with filtering, pagination, and detail modals.

## Features

### Dynamic GitHub Projects
- Fetches repositories via the GitHub REST API
- Pinned repos displayed first, then sorted by stars and update date
- Portfolio repo is automatically hidden
- Static tech filters (React, Vue, Flutter, Laravel, Next.js, FastAPI, Express)
- Responsive card grid with animated transitions

### Pre-Generated Site Screenshots
- Card previews use static screenshots captured via Puppeteer
- Screenshots stored in `public/screenshots/{repo-name}.webp`
- Instant loading — no API calls or iframe rendering
- Falls back to a styled tech placeholder if no screenshot exists

### Two-Page Layout
- **Home page** (`/`) — Hero, About, Skills, 3 project cards + "Show more"
- **Projects page** (`/projects`) — Full grid with filters, 9 per page, arrow pagination
- Client-side routing with `react-router-dom`
- Navbar links scroll to sections on home or navigate between pages

### Project Detail Modal
- Opens on card click with full project info
- Technologies used (language + repository topics)
- Direct links to GitHub repo and live demo
- Live iframe preview of the deployed site
- Full README rendered from Markdown (fetched via raw download URL)
- Styled scrollbar, ESC key and outside-click to close

### Markdown Rendering
- `react-markdown` with `remark-gfm` (GitHub Flavored Markdown)
- Custom styling for headings, paragraphs, lists, code blocks, tables, images, blockquotes

### Hero Section
- Animated typewriter role effect
- Profile image with fallback initials
- Quick links (Email, GitHub, LinkedIn)
- "View CV" button with modal preview
- Featured project card linking to projects page

### Skills Section
- Categorized skill lanes (Frontend, Mobile, Backend, Tools)
- Staggered reveal animation on scroll

### Navigation
- Fixed navbar with scroll-aware visibility
- Auto-hides when modals are open
- Responsive mobile menu with slide-down panel
- Smart hash navigation (scrolls on home, navigates from other pages)

### Responsive Design
- Fully responsive across mobile, tablet, and desktop
- Tailwind CSS utility-first approach

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, Vite |
| Styling | Tailwind CSS 4 |
| Routing | react-router-dom |
| Animations | Framer Motion |
| Data | GitHub REST API |
| Markdown | react-markdown, remark-gfm |
| Screenshots | Puppeteer (local script) |
| Deployment | Vercel |

## Project Structure

```
src/
├── App.jsx                  # Routes & scroll management
├── main.jsx                 # Entry point with BrowserRouter
├── style.css                # Global styles, scrollbar, cursor
├── components/
│   ├── Navbar.jsx           # Fixed nav with hash + route navigation
│   ├── Hero.jsx             # Hero section with typewriter & CV modal
│   ├── About.jsx            # About section
│   ├── Skills.jsx           # Skills grid with reveal animation
│   ├── ProjectsPreview.jsx  # Home page — 3 cards + "Show more"
│   ├── ProjectsPage.jsx     # /projects — filters, 9/page, pagination, modal
│   ├── projectsData.jsx     # Shared: GitHub fetch, cards, preview, helpers
│   ├── Contact.jsx          # Contact section
│   └── Footer.jsx           # Footer with dynamic year
├── assets/
│   └── Zahraa_Salim_CV.pdf
public/
├── screenshots/             # Pre-generated site preview images
│   ├── AurumRealty.webp
│   ├── flower-shop.webp
│   └── ...
scripts/
└── take-screenshots.mjs     # Puppeteer screenshot generator
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Updating Screenshots

When you add a new project with a live URL or update an existing site, regenerate the preview screenshots:

```bash
node scripts/take-screenshots.mjs
```

This uses your locally installed Chrome to visit each site, wait for it to fully render, and save a 1280×800 WebP screenshot to `public/screenshots/`. Then commit the new images and redeploy.

To add a new site, edit the `SITES` array in `scripts/take-screenshots.mjs`.

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_GITHUB_TOKEN` | GitHub personal access token (avoids rate limits) | Optional |

Create a `.env` file:
```
VITE_GITHUB_TOKEN=ghp_your_token_here
```
