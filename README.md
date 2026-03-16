# ⚡ Mission Control

Ryan Dolph's command center for life and business. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Quick Start

```bash
cd mission-control
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Screens

| Screen | Path | Description |
|--------|------|-------------|
| Dashboard | `/` | Overview with stats, tasks, schedule, projects, KRA |
| Task Board | `/tasks` | Kanban board (Backlog → In Progress → Review → Done) |
| Inbox | `/inbox` | Unified email + Hatch messages with action buttons |
| Calendar | `/calendar` | Weekly view with color-coded events |
| KRA Dashboard | `/kra` | Agent performance leaderboard |
| Projects | `/projects` | Project cards with progress tracking |
| Workflows | `/workflows` | Automation status (Make, Notion, GHL) |
| Memories | `/memories` | Daily memory entries |
| Docs | `/docs` | Searchable document library |
| Team | `/team` | Org chart and mission statement |
| Settings | `/settings` | Integrations and preferences |

## Deploy to Render

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repo
4. Render will auto-detect `render.yaml` and configure:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm run start`
   - **Port:** 10000

Or use the Dockerfile for container deployment.

## Tech Stack

- **Next.js 14** (App Router, standalone output)
- **TypeScript**
- **Tailwind CSS** (custom dark theme)
- **Lucide React** (icons)
- All data is currently mock — real integrations (Notion, GHL, Google Calendar) coming next.

## Architecture

```
src/
├── app/           # Pages (App Router)
├── components/    # Shared UI (Sidebar, TopBar, Card)
└── lib/           # Mock data + utils
```
