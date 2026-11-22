/* ==========================================================================
   Core: prototype state, small UI helpers (components) and the route registry.
   Everything is mock. State lives in this browser only (localStorage).
   ========================================================================== */
(function () {
  'use strict';
  const D = window.EX_DATA;

  /* ---------- State ---------- */
  const KEY = 'examinise-proto-v1';
  const DEFAULTS = {
    auth: true,                     // signed in?
    user: { name: 'John Doe', email: 'john.doe@example.com' },
    band: '18+',                    // 'u16' | '16-17' | '18+'  (date of birth is never stored)
    approval: 'none',               // under 16: 'none' | 'pending' | 'approved'
    parentEmail: '',
    school: null,                   // school name when joined by code
    plan: 'free',                   // 'free' | 'pro' | 'school'
    cycle: 'yearly',                // 'monthly' | 'yearly'
    renews: null,                   // ISO date
    payRequest: null,               // { email, cycle } when a parent has been asked to pay
    theme: 'system',                // 'system' | 'light' | 'dark'
    progress: {},                   // topicId -> { fc, quiz: {score,total}, notes }
    history: []                     // recent activity, newest first: { topic, mode, at }
  };
  function load() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  const S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: fine */ } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} Object.assign(S, JSON.parse(JSON.stringify(DEFAULTS))); save(); }
  // Temporary values for a flow in progress (not saved), e.g. the email being verified.
  const flow = {};

  /* ---------- Theme ---------- */
  function applyTheme() {
    const r = document.documentElement;
    if (S.theme === 'system') r.removeAttribute('data-theme'); else r.dataset.theme = S.theme;
  }

  /* ---------- Study rules ---------- */
  const isLocked = (chapter) => S.plan === 'free' && chapter.index > 0;
  const prog = (id) => S.progress[id] || (S.progress[id] = { fc: false, quiz: null, notes: false });
  const topicDone = (t) => { const p = S.progress[t.id] || {}; return (p.fc ? 1 : 0) + (p.quiz ? 1 : 0) + (p.notes ? 1 : 0); };
  const topicPct = (t) => Math.round(topicDone(t) / 3 * 100);
  const allTopics = (s) => s.chapters.flatMap(c => c.topics);
  const subjectPct = (s) => { const ts = allTopics(s); return Math.round(ts.reduce((a, t) => a + topicDone(t), 0) / (ts.length * 3) * 100); };
  const topicsDone = (s) => allTopics(s).filter(t => topicDone(t) === 3).length;
  const nextTopic = (s) => allTopics(s).find(t => topicDone(t) < 3 && !isLocked(t.chapter)) || allTopics(s)[0];
  function record(t, mode) {
    S.history = [{ topic: t.id, mode, at: Date.now() }].concat(S.history.filter(h => !(h.topic === t.id && h.mode === mode))).slice(0, 12);
    save();
  }
  // Typed answers. OPEN DECISION: leniency for case, spelling and Irish fadas.
  // Prototype default: ignore case, extra spaces and fadas. Change here only.
  const TYPED_RULES = { ignoreCase: true, ignoreFadas: true };
  function normalise(v) {
    let s = String(v).trim().replace(/\s+/g, ' ');
    if (TYPED_RULES.ignoreCase) s = s.toLowerCase();
    if (TYPED_RULES.ignoreFadas) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return s;
  }

  /* ---------- Components ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n, cls) => '<i class="ic' + (cls ? ' ' + cls : '') + '" style="--i:var(--i-' + n + ')" aria-hidden="true"></i>';

  // Button or link styled as a button. opts: { variant, size, href, id, icon, iconEnd, block, attrs }
  function btn(label, o) {
    o = o || {};
    const cls = ['btn', 'btn-' + (o.variant || 'primary'), o.size === 'sm' ? 'btn-sm' : '', o.block ? 'btn-block' : '', o.cls || ''].join(' ').trim();
    const inner = (o.icon ? icon(o.icon, 's20') : '') + '<span>' + esc(label) + '</span>' + (o.iconEnd ? icon(o.iconEnd, 's20') : '');
    const a = (o.id ? ' id="' + o.id + '"' : '') + (o.attrs || '');
    const type = /type=/.test(o.attrs || '') ? '' : ' type="button"';
    return o.href ? '<a class="' + cls + '" href="' + o.href + '"' + a + '>' + inner + '</a>' : '<button' + type + ' class="' + cls + '"' + a + '>' + inner + '</button>';
  }
  // Pill list row. opts: { href, lead (html), title, sub, end (html), locked, attrs }
  function row(o) {
    const tag = o.href ? 'a' : (o.button ? 'button' : 'div');
    const href = o.href ? ' href="' + o.href + '"' : '';
    const type = o.button ? ' type="button"' : '';
    return '<' + tag + ' class="lrow' + (o.locked ? ' locked' : '') + (o.href || o.button ? ' is-link' : '') + '"' + href + type + (o.attrs || '') + '>' +
      (o.lead || '') +
      '<span class="txt"><b>' + esc(o.title) + '</b>' + (o.sub ? '<span>' + esc(o.sub) + '</span>' : '') + '</span>' +
      (o.end || '') + '</' + tag + '>';
  }
  const lead = (inner, cls) => '<span class="num' + (cls ? ' ' + cls : '') + '">' + inner + '</span>';
  const proTag = () => '<span class="tag">' + icon('lock', 's16') + 'Pro</span>';
  const bar = (pct) => '<div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="--p:' + pct + '%"></i></div>';
  // Page heading. opts: { eyebrow, title, sub }
  const head = (o) => '<header class="page-head">' + (o.eyebrow ? '<p class="t-eyebrow muted">' + esc(o.eyebrow) + '</p>' : '') +
    '<h1 class="t-h1">' + esc(o.title) + '</h1>' + (o.sub ? '<p class="muted">' + esc(o.sub) + '</p>' : '') + '</header>';
  const section = (title, inner, extra) => '<section class="sec-block">' + (title ? '<h2 class="t-eyebrow muted sec-title">' + esc(title) + '</h2>' : '') + (extra || '') + '<div class="list">' + inner + '</div></section>';
  function field(o) {
    const id = o.id || ('f' + Math.random().toString(36).slice(2, 8));
    return '<div class="field"><label for="' + id + '">' + esc(o.label) + '</label>' +
      '<input class="input" id="' + id + '" type="' + (o.type || 'text') + '"' + (o.value != null ? ' value="' + esc(o.value) + '"' : '') +
      (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + (o.attrs || '') + '>' +
      (o.help ? '<p class="help">' + esc(o.help) + '</p>' : '') + '<p class="help err" hidden></p></div>';
  }
  function fieldError(input, msg) {
    const err = input.closest('.field').querySelector('.err');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.hidden = !msg; err.innerHTML = msg ? icon('info', 's16') + esc(msg) : '';
  }
  // Prototype-only note, so reviewers can tell mock behaviour apart from the design.
  const protoNote = (html) => '<p class="proto-note">' + icon('info', 's16') + '<span>' + html + '</span></p>';
  const note = (html, ic) => '<div class="note">' + icon(ic || 'info', 's20') + '<div>' + html + '</div></div>';
  function seg(name, options, value) {
    return '<div class="seg" role="radiogroup" data-seg="' + name + '">' + options.map(o =>
      '<button type="button" role="radio" aria-checked="' + (o[0] === value) + '" data-v="' + o[0] + '">' + esc(o[1]) + '</button>').join('') + '</div>';
  }
  // Segmented control behaviour: simple selected state (thumb slide is polish for later).
  function bindSeg(root, name, onChange) {
    const el = root.querySelector('[data-seg="' + name + '"]');
    if (!el) return;
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      onChange(b.dataset.v);
    });
  }

  /* ---------- Toast and dialog ---------- */
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = icon('check', 's20') + '<span>' + esc(msg) + '</span>';
    toastEl.classList.add('show'); clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }
  // Opens a dialog (a bottom sheet on phones). Returns the element; it removes itself on close.
  function dialog(html) {
    const d = document.createElement('dialog');
    d.className = 'dlg'; d.innerHTML = html;
    document.body.appendChild(d);
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', e => { if (e.target === d) d.close(); if (e.target.closest('[data-close]')) d.close(); });
    d.showModal();
    return d;
  }

  /* ---------- Routes ---------- */
  const ROUTES = {};
  const route = (name, fn) => { ROUTES[name] = fn; };
  const go = (hash) => { if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = hash; };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
  const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'Just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' h ago'; return Math.round(h / 24) + ' days ago'; };
  const firstName = () => S.user.name.split(' ')[0];

  window.EX = { S, save, reset, flow, applyTheme, D, isLocked, prog, topicDone, topicPct, subjectPct, topicsDone, allTopics, nextTopic, record, normalise,
    esc, icon, btn, row, lead, proTag, bar, head, section, field, fieldError, protoNote, note, seg, bindSeg, toast, dialog,
    ROUTES, route, go, fmtDate, ago, firstName };
})();
