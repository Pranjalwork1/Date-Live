# 🌙 Moonlit — Watch Together

> **"Different places. One little movie night."**

Moonlit is a virtual movie-date web application engineered for two people who want to watch movies, talk, chat, and share moments together in real time—whether they are partners in a long-distance relationship, couples spending an evening apart, or close friends.

Built with Next.js App Router, Tailwind CSS, Framer Motion, LiveKit WebRTC, and Supabase PostgreSQL.

---

## ✨ Features

- **Dynamic Island-Inspired Navigation**:
  - **Landing Page**: Compact floating capsule with live status, branding, and quick actions.
  - **In-Room**: Morphs into a live session capsule displaying connection status, room mood, active elapsed session timer, participant avatar stack, and one-click session controls.
- **Real Screen Sharing with Tab Audio**:
  - LiveKit WebRTC transport + native browser `getDisplayMedia` capture.
  - Independent audio tracks for movie sound and microphones—so talking or laughing never interrupts movie audio.
  - Dedicated waiting state, aspect-ratio preservation (`object-contain`), theater mode, and full-screen support.
- **Two-Way Voice Communication**:
  - Real-time microphone audio with speaking ring detection and mute/unmute controls.
- **Apple-Style Floating Reactions**:
  - Interactive reaction trigger expanding into an Apple-style floating reaction bar.
  - 11 romantic emoji reactions (`❤️`, `💕`, `😍`, `🥹`, `😘`, `😂`, `😮`, `👏`, `✨`, `🎉`, `🍿`).
  - Floating animations that drift upward across the cinema stage with soft glows.
  - Distributed in real-time via LiveKit DataPacket and cross-tab BroadcastChannel.
- **Real-Time Persistent Chat**:
  - Collapsible drawer/sidebar for whispering notes, jokes, and reactions.
  - Differentiated local/remote bubbles with auto-scroll and newline support.
- **4 Romantic Room Moods / Themes**:
  - **Midnight Romance**: Deep navy, indigo, and soft rose.
  - **Candlelight**: Warm velvet plum, shadow, and champagne amber.
  - **Dreamy Lavender**: Twilight purple, soft violet, and blush.
  - **Cozy Cinema**: Dark obsidian charcoal, cedar, and warm amber.
- **Cozy Ambient Soundscapes (Web Audio API)**:
  - Built-in, royalty-free audio generator: Gentle Window Rain, Crackling Fireplace, or Starlight Drone with dedicated volume control (disabled by default).
- **Session End Statistics**:
  - Romantic date summary screen calculating total shared movie time when leaving.

---

## 🏗️ Architecture Overview

```
User visits Moonlit / creates room
         │
         ▼
Next.js Route Handlers (/api/room/create, /api/room/join)
         │
         ├─► Supabase PostgreSQL (Rooms, Members, Persistent Messages, RLS)
         │   [or Server Memory Store fallback for instant local dev]
         │
         ▼
LiveKit Server SDK Token Minting (/api/livekit/token)
         │
         ▼
LiveKit Cloud WebRTC Media Server
         │
         ├─► High-Definition Screen Share Video Track
         ├─► Dedicated Tab Audio Track (Movie sound)
         ├─► Two-Way Microphone Audio Tracks
         └─► Real-Time DataPackets (Reactions, Chat sync)
```

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Real-Time Audio & Video**: LiveKit (`livekit-client`, `@livekit/components-react`, `livekit-server-sdk`)
- **Database & Auth**: Supabase (`@supabase/supabase-js`)
- **Soundscapes**: Web Audio API (Zero external assets required)

---

## 🛠️ Local Setup & Quickstart

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd "Movie Date Website"
npm install
```

### 2. Environment Variables

Copy the provided `.env.example` template to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Optional for local dev; built-in memory fallback included)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# LiveKit Cloud (Optional for local dev; native browser transport fallback included)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

> **Note**: Even before setting cloud credentials, Moonlit works 100% out of the box locally! Real screen sharing with tab audio, reactions, and chat will function seamlessly using browser WebRTC and BroadcastChannel.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup & Database Migration

1. Create a free project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20240101000000_init_moonlit.sql` from this repository.
4. Paste the SQL script into the SQL Editor and click **Run**.
5. The migration creates:
   - `profiles`: User profile data.
   - `date_rooms`: Room metadata, unguessable invitation codes, and 24-hour expirations.
   - `room_members`: Participants and host roles.
   - `room_messages`: Persistent room messages.
   - Full **Row Level Security (RLS)** policies restricting unauthorized access.
6. Under **Authentication -> Providers**, enable **Anonymous Sign-In** (if using guest flow) or email authentication.
7. Retrieve your **Project URL** and **API Keys** from **Settings -> API** and add them to `.env.local`.

---

## 📡 LiveKit Cloud Setup

1. Create a free account at [LiveKit Cloud](https://livekit.io/cloud).
2. Create a new project.
3. In **Project Settings -> Keys**, generate an **API Key** and **API Secret**.
4. Copy the **WebSocket Server URL** (e.g. `wss://xxxx.livekit.cloud`).
5. Paste these into `NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` in `.env.local`.

---

## 🧪 Testing & Verification

Run the security and logic unit test suite:

```bash
npm run test
```

Run ESLint verification:

```bash
npm run lint
```

Run the production build:

```bash
npm run build
```

---

## 🎬 How to Share Movie Audio (User Guide)

When sharing a movie from a browser:
1. Click **Share Screen** in the bottom control dock.
2. In the browser screen selection dialog, choose the **Chrome / Edge / Brave Tab** where your movie is playing.
3. **CRITICAL**: Check the box that says **"Also share tab audio"** at the bottom-left of the dialog.
4. Your partner will receive the live video track and crystal-clear tab audio track simultaneously, with independent volume controls.

*Note on DRM*: Services like Netflix, Prime Video, or Disney+ may block video capture at the browser GPU level using hardware DRM. For smooth viewing, use web players, YouTube, Vimeo, Plex, or disable hardware acceleration in your browser settings if necessary.

---

## 🚢 Vercel Deployment

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. In the project settings, add the environment variables from `.env.example`.
4. Deploy! Next.js App Router will automatically serve the application with optimized Edge and Serverless route handlers.
