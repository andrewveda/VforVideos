/* shared.js — V for Video shared utilities */

export const SUPABASE_URL = 'https://yellow-lab-4999.andrewveda.workers.dev';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZXpzc29jenZwYmt0ZWZmY2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTk1ODUsImV4cCI6MjA3ODQzNTU4NX0.2ZlqXnZxv0opkhynAT7OlK4S-xPygcc7ETUyTXRfGHE';
export const DATA_URL = 'https://andrewveda.github.io/SRM-VEC-English-PWA/buttons/videoquests.json';

/* Auth helpers */
export function getAuth() {
  try {
    return {
      name: localStorage.getItem('vfv_name') || '',
      dept: localStorage.getItem('vfv_dept') || ''
    };
  } catch { return { name: '', dept: '' }; }
}
export function setAuth(name, dept) {
  try {
    localStorage.setItem('vfv_name', name);
    localStorage.setItem('vfv_dept', dept);
  } catch {}
}
export function requireAuth() {
  const auth = getAuth();
  if (!auth.name || !auth.dept) {
    window.location.href = 'index.html';
    return null;
  }
  return auth;
}

/* Progress helpers — keyed by questId */
export function getProgress() {
  try { return JSON.parse(localStorage.getItem('vfv_progress') || '{}'); } catch { return {}; }
}
export function setProgress(map) {
  try { localStorage.setItem('vfv_progress', JSON.stringify(map)); } catch {}
}
export function getCompleted() {
  try { return new Set(JSON.parse(localStorage.getItem('vfv_completed') || '[]')); } catch { return new Set(); }
}
export function markCompleted(questId) {
  const set = getCompleted();
  set.add(questId);
  try { localStorage.setItem('vfv_completed', JSON.stringify([...set])); } catch {}
}

/* Data fetching with cache */
export async function fetchData() {
  try {
    const cached = sessionStorage.getItem('vfv_data');
    if (cached) return JSON.parse(cached);
  } catch {}
  const res = await fetch(DATA_URL);
  const data = await res.json();
  try { sessionStorage.setItem('vfv_data', JSON.stringify(data)); } catch {}
  return data;
}

/* URL-safe video ID from questId (strip non-alphanumeric, lowercase) */
export function toUrlId(questId) {
  return String(questId).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

/* Extract YouTube video ID from various URL formats */
export function extractYtId(url) {
  if (!url) return '';
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /embed\/([^?&]+)/,
    /shorts\/([^?&]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  // Fallback: if it's already just an ID (no slashes, no dots)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return url;
}

export function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Stars background */
export function initStars(containerId = 'stars') {
  const c = document.getElementById(containerId);
  if (!c) return;
  for (let i = 0; i < 130; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2.2 + 0.4;
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--d:${(Math.random()*4+2).toFixed(1)}s;--dl:-${(Math.random()*6).toFixed(1)}s;--lo:${(Math.random()*.1).toFixed(2)};--hi:${(Math.random()*.6+.25).toFixed(2)}`;
    c.appendChild(s);
  }
}

/* Nav menu setup */
export function initNav(auth) {
  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');
  const menuWrap = document.getElementById('menuWrap');
  if (!menuBtn || !menuDropdown) return;

  if (auth) {
    menuBtn.style.display = 'flex';
    document.getElementById('menuName').textContent = auth.name;
    document.getElementById('menuDept').textContent = auth.dept;
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menuDropdown.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!menuWrap.contains(e.target)) {
      menuDropdown.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}
