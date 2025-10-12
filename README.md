# Study Companion

> A hackathon prototype that helps students lock in and find the right people to study with.

**Live site:** https://adammirmina.github.io/HelloWorldHackathon/  
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
└─ docs/                     # GitHub Pages root (site lives here)
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

## Deployment (GitHub Pages)

This repo is already set up to deploy from **`main` → `docs/`**.  
Push to `main`, then check your site at:

```
https://<your-username>.github.io/HelloWorldHackathon/
```

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
