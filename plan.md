# TypeRacer Application — Project Plan

## Overview

A real-time typing race application built with **React** (frontend) and **Node.js** (backend). Users join with a nickname, race in solo or team mode, and see live feedback as they type.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Real-time | Socket.IO |
| State (server) | In-memory (TS objects/Maps) |
| State (client) | React state / Context |
| Styling | TailwindCSS |

---

## Project Structure

```
typeracer/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Nickname/         # Nickname entry screen
│   │   │   ├── Home/             # Mode selection (Solo / Team)
│   │   │   ├── Solo/             # Solo race screen
│   │   │   ├── Team/
│   │   │   │   ├── CreateRoom/   # Admin room creation form
│   │   │   │   ├── JoinRoom/     # Join with room ID
│   │   │   │   ├── Lobby/        # Waiting room before race
│   │   │   │   ├── Race/         # Live race screen
│   │   │   │   └── Leaderboard/  # End-of-race results
│   │   │   └── Shared/
│   │   │       ├── TypingBox/    # Core typing component (reused)
│   │   │       ├── ProgressBar/  # Per-user progress bar
│   │   │       └── WPMDisplay/   # Words per minute display
│   │   ├── context/
│   │   │   └── AppContext.tsx    # Nickname, socket, global state
│   │   ├── hooks/
│   │   │   ├── useTyping.ts      # Typing logic, WPM, error tracking
│   │   │   └── useSocket.ts      # Socket.IO connection wrapper
│   │   ├── types/
│   │   │   └── index.ts          # Shared frontend types & interfaces
│   │   ├── data/
│   │   │   └── paragraphs.ts     # Static list of paragraphs by word count
│   │   └── App.tsx
│
├── server/                   # Node.js backend
│   ├── index.ts              # Express + Socket.IO entry point
│   ├── rooms.ts              # In-memory room store
│   ├── paragraphs.ts         # Static paragraph data (mirrored)
│   ├── types/
│   │   └── index.ts          # Shared backend types & interfaces
│   └── socket/
│       ├── soloHandlers.ts   # Solo mode socket events
│       └── teamHandlers.ts   # Team mode socket events
```

---

## Features Breakdown

### 1. Nickname Entry
- On first visit, user is prompted to enter a nickname (required).
- Nickname stored in React context + localStorage so it persists on refresh.
- No authentication, no accounts.

---

### 2. Home Screen
- Two mode cards: **Solo** and **Team**.
- User picks a mode to proceed.

---

### 3. Solo Mode

**Flow:**
1. User lands on Solo screen.
2. A random paragraph is selected from the static list.
3. User clicks "Start" → timer and WPM tracking begins.
4. User types in the typing box.

**Typing Box Behaviour:**
- Paragraph is displayed word by word.
- Each word is highlighted as the user reaches it.
- Characters are coloured in real-time:
  - **Green** → correct character
  - **Red** → incorrect character
- User **can type ahead freely** — they are not blocked at a wrong word.
- Words with errors remain marked red as the user moves forward.
- The user must go back and correct all red words before the race can be marked complete.
- Race completes only when every word in the paragraph is correctly typed (zero red words remaining).

**WPM Calculation:**
- WPM = (number of correctly typed words / elapsed time in minutes).
- Displayed live during typing, updated every second.
- Final WPM shown on completion screen.

**Completion Screen:**
- Final WPM
- Time taken
- Accuracy percentage (correct keystrokes / total keystrokes)

---

### 4. Team Mode

#### 4a. Create Room (Admin)
- Admin enters:
  - **Word count** — slider or input (max 500 words)
  - **Time limit** — slider or input (max 5 minutes)
- Server generates a unique **6-character alphanumeric Room ID**.
- Admin is taken to the Lobby.
- Room ID is displayed prominently for sharing.

#### 4b. Join Room
- User enters the Room ID.
- If room exists and race hasn't started → user joins Lobby.
- If room doesn't exist or race is in progress → show error.
- Maximum **10 users** per room (including admin).

#### 4c. Lobby
- Shows list of all connected users in real-time.
- Admin sees a **"Start Race"** button; other users see "Waiting for admin to start…".
- Any user can leave before the race starts.

#### 4d. Live Race Screen
- Same typing box behaviour as Solo mode.
- **Progress panel** (visible to all):
  - One row per user showing:
    - Nickname
    - Progress bar (% of paragraph completed)
    - Live WPM
  - Updates in real-time via Socket.IO.
- **Countdown timer** visible to all (counts down from admin-set time limit).
- Race ends when:
  - All users complete the paragraph, OR
  - Timer reaches zero — whichever comes first.

#### 4e. Leaderboard
- Shown to all users in the room when race ends.
- Ranked by:
  1. Completion (finished users ranked first)
  2. Among finishers → ranked by time taken
  3. Among non-finishers → ranked by % completed
- Columns: Rank, Nickname, WPM, Accuracy, Status (Finished / Did not finish)
- Room is closed after leaderboard is shown.
- Users can navigate back to Home to start fresh.

---

## Data Models (In-Memory, Server)

### Room Object
```ts
// types/index.ts (shared between server modules)

type RoomStatus = "lobby" | "racing" | "finished";
type UserStatus = "racing" | "finished";

interface RoomUser {
  nickname: string;
  progress: number;       // % of paragraph completed (0–100), words-based
  wpm: number;
  accuracy: number;
  finishedAt: number | null;  // timestamp (Date.now()) or null
  status: UserStatus;
}

interface RoomSettings {
  wordCount: number;      // chosen by admin, max 500
  timeLimit: number;      // in seconds, max 300
}

interface Room {
  id: string;             // 6-char alphanumeric e.g. "A3F9KL"
  adminId: string;        // socket ID of the admin
  settings: RoomSettings;
  paragraph: string;      // selected from static list based on wordCount
  users: Map<string, RoomUser>;  // keyed by socket ID
  status: RoomStatus;
  startedAt: number | null;      // timestamp or null
  timerRef: ReturnType<typeof setInterval> | null;
}

// In-memory store
const rooms = new Map<string, Room>();
```

---

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `solo:start` | `{ nickname }` | Start a solo session (no room needed) |
| `room:create` | `{ nickname, wordCount, timeLimit }` | Admin creates a room |
| `room:join` | `{ nickname, roomId }` | User joins a room |
| `room:start` | `{ roomId }` | Admin starts the race |
| `race:progress` | `{ roomId, progress, wpm, accuracy }` | User sends typing progress update |
| `race:finish` | `{ roomId, wpm, accuracy, timeTaken }` | User completed the paragraph |
| `room:leave` | `{ roomId }` | User leaves the room |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `solo:paragraph` | `{ paragraph }` | Paragraph sent for solo mode |
| `room:created` | `{ roomId, paragraph }` | Confirms room creation, sends paragraph |
| `room:joined` | `{ roomId, paragraph, users }` | Confirms join, sends current room state |
| `room:updated` | `{ users }` | Lobby user list changed |
| `race:start` | `{ startedAt, timeLimit }` | Race has begun |
| `race:update` | `{ users }` | Live progress update for all users |
| `race:end` | `{ leaderboard }` | Race over, final results |
| `room:error` | `{ message }` | Room not found, full, etc. |

---

## Static Paragraph Data Strategy

- `paragraphs.js` holds an array of pre-written paragraphs of varying lengths.
- Each paragraph is tagged with its word count.
- When a room is created, server picks the closest paragraph to the admin's chosen word count.
- For solo mode, a random paragraph is picked.

```ts
// paragraphs.ts (same structure used on both client and server)

interface Paragraph {
  id: number;
  wordCount: number;
  text: string;
}

const paragraphs: Paragraph[] = [
  { id: 1, wordCount: 50, text: "The quick brown fox..." },
  { id: 2, wordCount: 100, text: "In the beginning..." },
  // ...up to 500 words
];
```

---

## WPM & Accuracy Calculation (Client-Side)

```
WPM = (correctly typed words so far) / (elapsed time in minutes)

Accuracy = (correct keystrokes / total keystrokes) * 100

Progress % = (number of correctly completed words / total words in paragraph) * 100
```

- **Progress** is based strictly on words that are correctly completed and will not decrease — a word only counts once it is green and the user has moved past it with no errors on it.
- **WPM** counts only correctly typed words, so errors that are later corrected are not double-counted.
- Calculated on the client every second and emitted to the server via `race:progress`.
- Server stores latest value and broadcasts to room via `race:update`.

---

## Build Phases

### Phase 1 — Foundation
- [ ] Set up Vite React + TypeScript project (`--template react-ts`)
- [ ] Set up Node/Express server with TypeScript (`ts-node` + `tsconfig.json`)
- [ ] Install and configure Socket.IO on both ends with typed events (`socket.io` + `socket.io-client`)
- [ ] Define shared types/interfaces in `types/index.ts` on both client and server
- [ ] Build Nickname entry screen
- [ ] Build Home screen (mode selection)
- [ ] Create static paragraph data file (`paragraphs.ts`)

### Phase 2 — Solo Mode
- [ ] Build core TypingBox component with real-time character validation
- [ ] Implement WPM tracking hook (`useTyping`)
- [ ] Build Solo race screen
- [ ] Build Solo completion screen

### Phase 3 — Team Mode (Lobby & Room)
- [ ] Build Create Room screen + server room creation logic
- [ ] Build Join Room screen + server join logic
- [ ] Build Lobby screen with live user list
- [ ] Handle max users (10) and room-not-found errors

### Phase 4 — Team Mode (Live Race)
- [ ] Build Race screen (reuse TypingBox)
- [ ] Implement `race:progress` emission every second
- [ ] Build per-user ProgressBar component
- [ ] Server broadcast of `race:update` to room
- [ ] Server-side countdown timer + `race:end` trigger

### Phase 5 — Leaderboard & Cleanup
- [ ] Build Leaderboard screen
- [ ] Implement ranking logic (finishers first, then by % completed)
- [ ] Room teardown after race ends
- [ ] Handle user disconnects mid-race gracefully

### Phase 6 — Polish
- [ ] Responsive design
- [ ] Loading states, error states
- [ ] Smooth animations on progress bars
- [ ] Countdown animation before race starts (3-2-1-Go)

---

## Edge Cases to Handle

| Scenario | Handling |
|---|---|
| Admin disconnects during lobby | Room closes, users notified |
| Admin disconnects during race | Race continues, no one can force-end |
| User disconnects mid-race | Their row stays on leaderboard as "Did not finish" |
| User tries to join a started race | Rejected with error message |
| Room ID entered incorrectly | Clear error shown |
| All users disconnect before race ends | Room auto-cleaned from memory |
| Timer ends but all finished earlier | Race ends at last finish, not timer |

---

## Future Enhancements (Post-MVP)

- Persistent leaderboard with a database
- User accounts and stats history
- Custom paragraph input by admin
- Spectator mode
- Different difficulty levels (punctuation, code snippets, etc.)
- Replay / ghost typing of top player
- Sound effects and animations
- Mobile support improvements