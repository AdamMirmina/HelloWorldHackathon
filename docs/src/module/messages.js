// docs/src/module/messages.js
import { auth } from "./auth.js";
import { db } from "../config/firebase.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ---------- DOM refs ---------- */
const $ = (id) => document.getElementById(id);
const threadsEl = $("threads");
const searchEl = $("search");
const chatBody = $("chatBody");
const peerName = $("peerName");
const peerMeta = $("peerMeta");
const inputEl = $("composerInput");
const sendBtn = $("sendBtn");
const threadCount = $("threadCount");

/* ---------- Demo data ---------- */
const defaultThreads = [
  {
    id: "t1",
    name: "Emily Chen · CS 180",
    initials: "EC",
    online: true,
    last: "Want to review loops after lab?",
    time: "2:54 PM",
    active: true,
    messages: [
      { dir: "in", text: "Hey! Want to review loops after lab?", ts: "2:54 PM" },
      { dir: "out", text: "Yes — 7:30 at WALC? (quiet side)", ts: "2:55 PM" },
      { dir: "in", text: "Perfect. I’ll grab a table.", ts: "2:56 PM" },
    ],
  },
  {
    id: "t2",
    name: "Jordan Patel · MA 261",
    initials: "JP",
    online: false,
    last: "Do you have the vector proj formula?",
    time: "Yesterday",
    active: false,
    messages: [
      { dir: "in", text: "Do you have the vector proj formula?", ts: "Yesterday" },
      { dir: "out", text: "proj_u(v) = (v·u / ||u||²) u", ts: "Yesterday" },
    ],
  },
  {
    id: "t3",
    name: "Study Group · Lofi Room",
    initials: "SG",
    online: true,
    last: "Timer set 50/10. See you at 8.",
    time: "Today",
    active: false,
    messages: [{ dir: "in", text: "Timer set 50/10. See you at 8.", ts: "Today" }],
  },
];

/* ---------- Per-user storage ---------- */
const KEY_PREFIX = "sc_demo_threads_v4"; // bump to refresh any old cached seed
const keyFor = (uid) => `${KEY_PREFIX}_${uid || "guest"}`;

let STORAGE_KEY = keyFor(auth.currentUser?.uid);
let threads = null;

/* ---------- Utilities ---------- */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function loadThreads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveThreads(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}
function initialsFrom(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
}
function nowStr() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/* ---------- Rendering ---------- */
function renderThreads(filter = "") {
  threadsEl.innerHTML = "";
  const list = threads.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );
  threadCount.textContent = String(threads.length);
  list.forEach((t) => {
    const row = document.createElement("div");
    row.className = "thread";
    row.dataset.id = t.id;
    row.innerHTML = `
      <div class="avatar">${t.initials}</div>
      <div>
        <p class="t-name">${t.name}</p>
        <p class="t-last">${t.last}</p>
      </div>
      <div class="t-meta">
        ${t.online ? '<span class="dot" title="Online"></span>' : ""}
        <span class="t-time">${t.time}</span>
      </div>
    `;
    row.addEventListener("click", () => openThread(t.id));
    threadsEl.appendChild(row);
  });
}

function openThread(id) {
  threads = threads.map((t) => ({ ...t, active: t.id === id }));
  const t = threads.find((x) => x.id === id) || threads[0];
  peerName.textContent = t.name;
  peerMeta.textContent = t.online ? "Online" : "Last seen recently";
  chatBody.innerHTML = "";
  t.messages.forEach((m) => {
    const bubble = document.createElement("div");
    bubble.className = `msg ${m.dir === "out" ? "out" : "in"}`;
    bubble.innerHTML = `${m.text}<div class="meta">${m.ts}${
      m.dir === "out"
        ? ` <span class="checks"><i data-lucide="check"></i><i data-lucide="check"></i></span>`
        : ""
    }</div>`;
    chatBody.appendChild(bubble);
  });
  chatBody.scrollTop = chatBody.scrollHeight;
  saveThreads(threads);
  if (window.lucide) window.lucide.createIcons();
}

function sendMessage() {
  const t = threads.find((x) => x.active) || threads[0];
  if (!t) return;
  const text = (inputEl.value || "").trim();
  if (!text) return;

  const out = { dir: "out", text, ts: nowStr() };
  t.messages.push(out);
  t.last = text;
  t.time = out.ts;

  const bubble = document.createElement("div");
  bubble.className = "msg out";
  bubble.innerHTML = `${out.text}<div class="meta">${out.ts} <span class="checks"><i data-lucide="check"></i><i data-lucide="check"></i></span></div>`;
  chatBody.appendChild(bubble);
  chatBody.scrollTop = chatBody.scrollHeight;
  inputEl.value = "";

  // fake typing + reply
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = `<span class="dotty"></span><span class="dotty"></span><span class="dotty"></span>`;
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const reply = {
      dir: "in",
      text: "Got it — see you soon!",
      ts: nowStr(),
    };
    t.messages.push(reply);
    t.last = reply.text;
    t.time = reply.ts;

    const inBubble = document.createElement("div");
    inBubble.className = "msg in";
    inBubble.innerHTML = `${reply.text}<div class="meta">${reply.ts}</div>`;
    chatBody.appendChild(inBubble);
    chatBody.scrollTop = chatBody.scrollHeight;

    saveThreads(threads);
  }, 900);

  saveThreads(threads);
  if (window.lucide) window.lucide.createIcons();
}

function initDemoThreads() {
  threads = loadThreads() || clone(defaultThreads);
  renderThreads();
  openThread(threads.find((t) => t.active)?.id || threads[0].id);
  saveThreads(threads);
}

/* ---------- Deep-link: ?with=<uid> (ensure/create once) ---------- */
let deepLinkedHandled = false;

async function ensurePeerThread(uid) {
  if (!uid) return;
  // If we already handled this session, don't do it again
  if (deepLinkedHandled) return;

  // Already have a thread?
  const existing = threads.find((t) => t.id === `user:${uid}`);
  if (existing) {
    deepLinkedHandled = true;
    openThread(existing.id);
    return;
  }

  // Fetch user doc for name + DM permission
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      alert("That user no longer exists.");
      deepLinkedHandled = true;
      return;
    }
    const data = snap.data();

    if (data.allowDMs === false) {
      alert("This user does not accept direct messages.");
      deepLinkedHandled = true;
      return;
    }
    if (data.public === false) {
      alert("This user's profile is private.");
      deepLinkedHandled = true;
      return;
    }

    const name = data.name || "User";
    const id = `user:${uid}`;
    const thread = {
      id,
      name,
      initials: initialsFrom(name),
      online: true,
      last: "Say hi 👋",
      time: nowStr(),
      active: true,
      messages: [{ dir: "in", text: "Hey! Feel free to say hi 👋", ts: nowStr() }],
    };

    // Deactivate others and add this one
    threads = threads.map((t) => ({ ...t, active: false }));
    threads.push(thread);
    renderThreads(searchEl.value || "");
    openThread(id);
    saveThreads(threads);
    deepLinkedHandled = true;
  } catch (e) {
    console.error("Failed to open peer thread:", e);
    alert("Could not open conversation.");
    deepLinkedHandled = true;
  }
}

/* ---------- Events ---------- */
searchEl.addEventListener("input", (e) => renderThreads(e.target.value));
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

/* ---------- Auth-aware storage namespace ---------- */
onAuthStateChanged(auth, (user) => {
  STORAGE_KEY = keyFor(user?.uid);
  threads = null; // switch namespace
  initDemoThreads();

  // Only handle deep link once, after threads are ready
  const withUid = new URLSearchParams(location.search).get("with");
  ensurePeerThread(withUid);
});

/* ---------- First paint ---------- */
if (window.lucide) window.lucide.createIcons();
initDemoThreads();
