# Study Companion

> A hackathon prototype that helps students lock in and find the right people to study with.

**Live site:** https://helloworld.adammirmina.com  
**Hackathon:** Purdue Hello World — **Sep 20–21, 2025**  
**Team:** Adam Mirmina, Bonnie Le, Kyler Yun

---

## What it is

Study Companion blends a focused **lofi study room**, lightweight **profiles**, and class-based **study buddy matching**.

- **Study Room** – distraction-light page with lofi ambience and a simple timer  
- **Find Study Buddies** – match by **school, classes, and preferences**  
- **Profiles** – public/private visibility, optional contact info  
- **Matching Score** – each candidate gets a **1–5 score** based on multiple signals:
  - Shared classes (highest weight; multiple overlaps boost the score)
  - Study style alignment (e.g., quiet vs. collaborative)
  - Time preference (morning / afternoon / evening)

> ⚠️ **Prototype status:**  
> **Private Messaging** is demo-only (local, non-realtime, no cross-device sync).  
> **Study Spots** is a proof-of-concept UI (not backed by live data yet).

---

## Tech

- **Frontend:** HTML/CSS/JS (static), hosted on **GitHub Pages**
- **Auth/Data:** **Firebase** (client SDK)
- **Repo layout:** the production site is served from the `docs/` directory
- **Routing:** client-side links are normalized to work both on GitHub Pages and Live Server (see `docs/src/module/nav.js`)

---

## Project structure

```
HelloWorldHackathon/
└─ docs/                     # site root (uploaded as Worker static assets)
   ├─ index.html             # Home
   ├─ about.html
   ├─ profile.html
   ├─ settings.html
   ├─ signin.html
   ├─ src/
   │  ├─ messages.html
   │  ├─ buddy.html
   │  ├─ lofi.html
   │  ├─ spots.html
   │  ├─ config/
   │  │  └─ firebase.js     # Your Firebase config
   │  └─ module/
   │     ├─ auth.js
   │     ├─ nav.js
   │     ├─ match.js
   │     ├─ messages.js
   │     ├─ profile.js
   │     └─ (other modules)
   ├─ audio/                 # lofi audio
   └─ wallpapers/            # background media
```

---

## Local development

1. **Clone** the repo and open it in VS Code.
2. Install the **Live Server** extension.
3. Right-click **`docs/index.html`** → **Open with Live Server**.
   - Your URL should look like: `http://127.0.0.1:5500/docs/index.html`
   - The nav is written to work both locally and on GitHub Pages.

> If you see “Cannot GET /…”, make sure you launched **`docs/index.html`** (not the repo root), and that you didn’t move files out of `docs/`.

---

## Firebase setup

Create a web app in Firebase and copy your config into:

```
docs/src/config/firebase.js
```

Example (keep keys client-side—this is normal for Firebase web apps):
```js
// docs/src/config/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "…",
  authDomain: "…",
  projectId: "…",
  storageBucket: "…",
  messagingSenderId: "…",
  appId: "…",
};

export const app = initializeApp(firebaseConfig);
export { app as default };
```

---

## Deployment (Cloudflare)

The site is a Cloudflare Worker serving `docs/` as static assets, on a custom
domain. Deploy with:

```
npx wrangler deploy
```

`wrangler.jsonc` pins an explicit `account_id`. That is deliberate rather than
tidy: several Cloudflare accounts are reachable from one login, and an unpinned
deploy asks the CLI to guess which.

The lofi track lives in the `helloworld-assets` R2 bucket under `audio/`, because
it is larger than the 25 MiB per-asset ceiling. To replace it:

```
npx wrangler r2 object put "helloworld-assets/audio/<file>.mp3" --file docs/audio/<file>.mp3 --content-type audio/mpeg --remote
```

Verify a deploy by checking bytes rather than status codes — a range request
that returns the whole file still answers `206`, and nothing reports it:

```
curl -sI http://helloworld.adammirmina.com/            # expect 301 -> https
curl -sI https://helloworld.adammirmina.com/           # expect Strict-Transport-Security
curl -s -D - -o /dev/null -H "Range: bytes=0-99" https://helloworld.adammirmina.com/audio/<file>.mp3
                                                       # expect 206 and Content-Length: 100
```

---

## Backend: migrating off Firebase

Auth, profiles, matching and messages still run on the Firebase project
`study-companion-3ad6d` via the client SDK, configured in
`docs/src/config/firebase.js`. That is being moved to a self-hosted PocketBase
instance, after which the Firebase project is retired.

Nothing here is broken today; this is recorded so that the Firebase project is
not deleted on the assumption that a static site does not need it. Sign-in,
settings and buddy matching all read from it, and deleting it first would leave
a half-working site on a live domain.

---

## Roadmap (nice-to-haves)

- Realtime messaging (presence, attachments), basic moderation
- Richer profiles (avatars, bios, allow-DMs toggle, email visibility)
- Study Spots directory with crowd levels, noise/outlet info, ratings
- Shared focus rooms (group Pomodoro synced in small cohorts)

---

## Privacy

Profiles can be public or private. Demo messages are stored only in your browser’s **localStorage** and are not transmitted to a server. Please don’t share sensitive information in the demo.

---

## License

MIT (or your preference).  
© 2025 Study Companion Team
