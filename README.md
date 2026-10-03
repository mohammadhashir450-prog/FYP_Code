# FYP - RepairEase Service Provider Dashboard

A modern, responsive Service Provider Admin Dashboard built with **Next.js 16** (App Router), **React 19**, **Tailwind CSS**, and **TypeScript**.

---

## 🚀 Features & Pages

- **Authentication & Registration** (`/login`) — Multi-step registration with document upload and live photo capture preview.
- **Pending Verification Status** (`/pending`) — Verification tracker with animated progress indicators until admin approval.
- **Dashboard Overview** (`/dashboard`) — Key metric stat cards (total jobs, average rating, completion rate), Recharts revenue trends, and recent job requests.
- **Job Requests Management** (`/jobs`) — Incoming, Ongoing, and History tabs with Accept / Reject / Complete actions and detail modals.
- **Live Customer Chat** (`/chat`) — Real-time chat interface with quick replies, file attachment simulation, and active job context.
- **One-Tap Calling** — Voice call integration simulation (Agora / Twilio ready).
- **Reviews & Ratings** (`/reviews`) — Customer feedback list with rating breakdown charts and filter by stars.
- **Availability Toggle & Live Map** (`/availability`) — Online / Offline status toggle with interactive live driver map (InDrive style).
- **Notifications Centre** (`/notifications`) — Real-time notification feed with category filters (jobs, chat, verification, system).
- **Profile Management** (`/profile`) — Shop details editing, avatar upload, and verification badge display.
- **Settings** (`/settings`) — Account settings, security, notifications preferences, and danger zone.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Charts**: Recharts
- **State**: React Context API (`AuthProvider`, `ToastProvider`)

---

## 📦 Project Structure

```
FYP_code/
├── provider-dashboard/     # Service Provider Web Dashboard (Next.js)
│   ├── src/
│   │   ├── app/            # App Router pages and routes
│   │   ├── components/     # UI components (Sidebar, Topbar, Layout, Toasts)
│   │   └── data/           # Mock data and stores
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation & Run

1. Navigate to the dashboard directory:
   ```bash
   cd provider-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment (single Vercel project)

`car-showcase` (Vite) is bundled into `provider-dashboard` (Next.js) at build time, so one deployment serves both:

- `/` and the dashboard routes → provider-dashboard
- `/showcase` → car-showcase

On Vercel: import this repo, set **Root Directory** to `provider-dashboard` (framework: Next.js, default build command). `npm run build` runs `scripts/build-showcase.mjs` first, which builds `../car-showcase` into `public/showcase` (generated, git-ignored).
