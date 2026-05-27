# Project Summary

## Goal
Upgrade the OTT streaming UI with cinematic Hero banner, expanded MovieCard hover preview, and premium Top 10 styling inspired by cinezo.net and 1flex.org.

## Constraints & Preferences
- Do NOT clone cinezo.net or 1flex.org — study their layout/behavior and apply ideas uniquely
- Trailers on every card hover is overrated (120+ TMDB API calls, 20+ iframes, FPS drops) — limit to Hero banner only
- Expanding card must NOT open a modal — preview happens inside the card via spring scale transform
- Preserve all existing backend/API logic, authentication, fetch functions, movie data structure
- No new carousel libraries — current CSS scroll-snap works well
- Prefer React, Tailwind CSS v4, Framer Motion, GSAP (already in project)

## Progress
### Completed
- Fixed Bug #3: rank badge overlaps bookmark button — bookmark shifts to `top-8 left-1` when rank present, rank badge gets `backdrop-blur-sm`
- Removed content overlay (title, rating, genres, action buttons) from TrendingBanner
- Removed YouTube trailer iframe section from TrendingBanner (with cleanup of unused state/effects/imports)
- Removed duplicate gradient overlays from both Hero.tsx and TrendingBanner.tsx
- Removed ErrorBoundary fallback UI — returns `null` on error (still logs to console)
- Removed TrendingBanner entirely from Home.tsx — only Hero remains as the single banner
- Upgraded Hero.tsx: Ken Burns backdrop zoom (`.animate-ken-burns`), staggered text animations (5-step delay cascade), "Trailer" button re-added, `glass-premium` container wrapping all content, premium IMDb-style rating badge, spring hover/click animations on buttons
- Overhauled MovieCard.tsx: Framer Motion `whileHover` spring expansion (`scale: 1.12, y: -10`), expanded hover info panel (genres, rating, year, language via `Globe` icon, overview, media type), slide-up info panel animation, compact Play/Info action buttons in panel, `largeRank` prop for giant numbers behind poster (Top 10 style with gold/silver/bronze coloring)
- Updated ContentRow.tsx: `showLargeRanking` prop support, passes `largeRank` to MovieCard
- Added cinematic CSS utilities to `index.css`: `.glass-premium`, `.animate-ken-burns`, `.animate-scale-in`, `.animate-slide-up-panel`, `.card-expanded-glow`, `.text-shadow-premium`
- Enabled `showLargeRanking` on "Trending Now" row in Home.tsx
- Cleaned up all unused variables — zero TypeScript errors

### Blocked
- (none)

## Key Decisions
- Trailer autoplay on card hover is overrated due to API cost and performance — only Hero banner gets video preview
- MovieCard expansion uses Framer Motion spring `whileHover` to avoid layout shifts in the flex row
- Video keys pre-fetched in batch per row (not per-card) only for the top featured row if needed
- ErrorBoundary now silently catches errors (logs to console, returns null)

## Critical Context
- `TMDBMovie` type does NOT include cast, runtime, or quality in basic list — expanded card shows only what's available from list data
- TrendingBanner is fully removed from Home.tsx — only Hero remains as the single banner
- Build runs at `npx tsc --noEmit` — must pass zero errors before commit
- This project uses Tailwind CSS v4 (`@import "tailwindcss"`) with `@theme` custom values
