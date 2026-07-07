# Gateway Student Accommodation — Maintenance Demo

Mobile-first **frontend demo** for [Gateway Student Accommodation](https://gatewayres.co.za/). All data and photo uploads are stored in **localStorage** in your browser — no server required.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 — you’ll land on the **login** screen.

**Demo password for all accounts:** `demo`

## Demo logins

| Username | Role | What they see |
|----------|------|----------------|
| `supervisor` | Supervisor | Full dashboard, all tasks, assign, budget |
| `sipho` | Technician | Only jobs assigned to **Sipho N.** |
| `teama` | Technician | Jobs for **Maintenance Team A** |
| `teamb` | Technician | Jobs for **Maintenance Team B** |
| `resident` | Resident | Log requests & track own reports |

Tap any account on the login screen for one-tap sign-in.

## Worker flow (mobile)

1. Sign in as `sipho`, `teama`, or `teamb`
2. **My Jobs** — today’s schedule, active, and completed work
3. Open a job → **Start job** → take **before/after photos** (saved locally)
4. Add notes and **Mark complete**

## Features

- Role-based navigation and access control
- Repair tasks with status workflow
- Photo & document uploads (base64 in localStorage, max 4 MB per file)
- Team notes and activity history
- Daily board, calendar, budget (supervisor)
- CSV export
- Mobile bottom nav + touch-friendly cards

## Storage keys

| Key | Contents |
|-----|----------|
| `gateway-auth-session` | Current login |
| `gateway-repairs` | All repairs, attachments, notes |

Clear site data in your browser to reset the demo.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS · Recharts

Optional `server/` folder remains from an earlier API prototype — **not required** for this demo.
