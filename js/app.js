/* ==========================================================================
   App: the shell (sidebar behind the main panel) and the hash router.
   Three layouts:
     shell   signed-in app: sidebar layer + rounded main panel
     solo    sign-up, log in and other full-screen steps (no sidebar)
     parent  what a parent sees from an email link (prototype only)
   A screen is a function in screens-*.js that returns
     { layout, nav, top: { left: 'menu'|'back'|'close', href, search }, html, mount(el) }
   ========================================================================== */
(function () {
  'use strict';
  const { S, icon, esc, ROUTES, go, applyTheme } = window.EX;
  const root = document.getElementById('root');
  const desktop = matchMedia('(min-width:900px)');

  /* ---------- Logo sprite (from the brand assets) ---------- */
  const L = window.EX_LOGO;
  const circle = '<circle cx="128" cy="128" r="128" mask="url(#ex-e-mask)" style="fill:var(--logo-mark)"/>';
  document.body.insertAdjacentHTML('afterbegin',
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<mask id="ex-e-mask" maskUnits="userSpaceOnUse" x="-20" y="-20" width="296" height="296"><rect x="-20" y="-20" width="296" height="296" fill="#fff"/>' +
    '<g transform="matrix(2.042553,0,0,2.042553,-71.217021,-165.855319)"><path d="' + L.ePath + '" fill="#000"/></g></mask>' +
    '<symbol id="ex-icon" viewBox="0 0 256 256">' + circle + '</symbol>' +
    '<symbol id="ex-wordmark" viewBox="0 103 256 49"><g transform="matrix(1.464252,0,0,1.464252,-39.144328,-55.324309)">' +
    '<g transform="matrix(0.125,0,0,0.125,26.733333,109.2)">' + circle + '</g>' +
    '<g transform="translate(3.25,-6.570213)" style="fill:var(--logo-word)">' + L.letters.map(d => '<path d="' + d + '"/>').join('') + '</g></g></symbol></defs></svg>');
  window.EX.wordmark = (h) => '<svg class="logo-word" style="--h:' + (h || 26) + 'px" role="img" aria-label="Examinise"><use href="#ex-wordmark"/></svg>';
  window.EX.logoMark = (s) => '<svg width="' + (s || 48) + '" height="' + (s || 48) + '" role="img" aria-label="Examinise"><use href="#ex-icon"/></svg>';

  /* ---------- Sidebar ---------- */
  const NAV = [
    ['Study', [['home', 'Home', 'home'], ['subjects', 'Subjects', 'subjects'], ['flashcards', 'Flashcards', 'flashcards', 'study/flashcards'], ['quizzes', 'Quizzes', 'quiz', 'study/quiz'], ['notes', 'Notes', 'notes', 'study/notes']]],
    ['Revision', [['papers', 'Past papers', 'papers'], ['progress', 'Progress', 'progress']]]
  ];
  function sidebarHTML() {
    const initials = S.user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return '<div class="wm">' + window.EX.wordmark(26) + '</div><nav class="sb-nav">' +
      NAV.map(([cat, items], i) => '<p class="cat' + (i ? '' : ' first') + '">' + cat + '</p>' +
        items.map(([id, label, ic, path]) => '<a class="item" data-nav="' + id + '" href="#/' + (path || id) + '">' + icon(ic) + '<span>' + label + '</span></a>').join('')).join('') +
      '</nav><div class="pwrap">' +
      '<div class="menu up" id="profMenu" role="menu">' +
        '<a class="item" role="menuitem" href="#/settings">' + icon('settings') + 'Settings</a>' +
        '<a class="item" role="menuitem" href="#/plan">' + icon('plan') + 'Plan</a>' +
        '<a class="item" role="menuitem" href="#/help">' + icon('help') + 'Help</a>' +
        '<a class="item" role="menuitem" href="#/feedback">' + icon('feedback') + 'Feedback</a>' +
        '<a class="item" role="menuitem" href="#/legal">' + icon('legal') + 'Legal</a>' +
        '<div class="menu-sep"></div>' +
        '<a class="item" role="menuitem" href="#/map">' + icon('more') + 'All screens (prototype)</a>' +
        '<button class="item danger" role="menuitem" type="button" id="logoutBtn">' + icon('logout') + 'Log out</button>' +
      '</div>' +
      '<button class="prof" type="button" id="profBtn" aria-haspopup="menu" aria-expanded="false"><span class="avatar">' + esc(initials) + '</span>' +
      '<span class="who">' + esc(S.user.name) + '<small>' + planLabel() + '</small></span>' + icon('more', 's20') + '</button></div>';
  }
  const planLabel = () => S.plan === 'pro' ? 'Pro' : S.plan === 'school' ? 'School' : 'Free';

  /* ---------- Shell (built once, then only the panel content changes) ---------- */
  let shell = null;
  function buildShell() {
    root.innerHTML =
      '<div class="app no-anim" id="app"><aside class="app-sb" aria-label="Main menu"></aside>' +
      '<div class="app-pg"><header class="app-top"><div class="top-l"></div><div class="top-r"></div></header>' +
      '<main class="app-main" id="main"><div class="app-content"></div></main>' +
      '<button class="app-scrim" aria-label="Close menu"></button></div></div>';
    const app = root.querySelector('#app');
    shell = { app, sb: app.querySelector('.app-sb'), left: app.querySelector('.top-l'), right: app.querySelector('.top-r'), main: app.querySelector('#main'), content: app.querySelector('.app-content') };
    app.querySelector('.app-scrim').addEventListener('click', () => setOpen(false));
    setOpen(desktop.matches);
    requestAnimationFrame(() => requestAnimationFrame(() => app.classList.remove('no-anim')));
  }
  function setOpen(open) {
    if (!shell) return;
    shell.app.classList.toggle('is-open', open);
    const b = shell.left.querySelector('#navBtn'); if (b) b.setAttribute('aria-expanded', String(open));
  }
  function renderSidebar(nav) {
    shell.sb.innerHTML = sidebarHTML();
    shell.sb.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === nav) { a.classList.add('is-on'); a.setAttribute('aria-current', 'page'); } });
    const menu = shell.sb.querySelector('#profMenu'), pb = shell.sb.querySelector('#profBtn');
    pb.addEventListener('click', e => { e.stopPropagation(); const o = !menu.classList.contains('is-open'); menu.classList.toggle('is-open', o); pb.setAttribute('aria-expanded', String(o)); });
    shell.sb.querySelector('#logoutBtn').addEventListener('click', () => { S.auth = false; window.EX.save(); go('#/welcome'); });
  }
  function renderTop(top) {
    top = top || {};
    const left = top.left || 'menu';
    if (left === 'menu') {
      shell.left.innerHTML = '<button class="round" id="navBtn" aria-label="Toggle menu" aria-expanded="false"><span class="swap">' + icon('menu', 'm') + icon('close', 'x') + '</span></button>';
      shell.left.querySelector('#navBtn').addEventListener('click', () => setOpen(!shell.app.classList.contains('is-open')));
    } else {
      shell.left.innerHTML = '<a class="round" href="' + top.href + '" aria-label="' + (left === 'close' ? 'Close' : 'Back') + '">' + icon(left === 'close' ? 'close' : 'left') + '</a>';
    }
    shell.left.insertAdjacentHTML('beforeend', top.title ? '<span class="top-title">' + esc(top.title) + '</span>' : '');
    shell.right.innerHTML = top.search === false ? (top.rightHTML || '') : '<a class="round" href="#/search" aria-label="Search">' + icon('search') + '</a>';
    shell.app.classList.toggle('is-focus', left === 'close');
    if (left !== 'menu' && !desktop.matches) setOpen(false);
  }

  /* ---------- Router ---------- */
  function parse() {
    const h = (location.hash || '#/').slice(2);
    const [path, q] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    let name = parts[0] || '', rest = parts.slice(1);
    // Two-part route names, e.g. study/flashcards, legal/terms
    if (rest.length && ROUTES[name + '/' + rest[0]]) { name = name + '/' + rest[0]; rest = rest.slice(1); }
    return { name, params: rest, query: new URLSearchParams(q || '') };
  }
  // Routes that work while signed out.
  const PUBLIC = ['welcome', 'signup', 'signup-school','login', 'verify', 'forgot', 'reset-password', 'age', 'school-code', 'parent-email', 'map', 'desktop-notice', 'goodbye',
    'parent', 'school-request', 'legal','legal/terms', 'legal/privacy'];

  function render() {
    let { name, params, query } = parse();
    if (!name) name = S.auth ? 'home' : 'welcome';
    if (!ROUTES[name]) name = 'notfound';
    // Guards
    if (!S.auth && PUBLIC.indexOf(name) < 0) { go('#/welcome'); return; }
    if (S.auth && S.band === 'u16' && S.approval === 'pending' && PUBLIC.concat(['parent-wait']).indexOf(name) < 0) { go('#/parent-wait'); return; }

    const v = ROUTES[name](params, query) || {};
    if (v.redirect) { go(v.redirect); return; }
    const layout = v.layout || 'shell';
    document.title = (v.title ? v.title + ' · ' : '') + 'Examinise';

    if (layout === 'shell') {
      if (!shell || !root.contains(shell.app)) buildShell();
      renderSidebar(v.nav);
      renderTop(v.top);
      shell.content.className = 'app-content' + (v.wide ? ' is-wide' : '');
      shell.content.innerHTML = v.html;
      shell.main.scrollTop = 0;
      if (!desktop.matches && (v.top || {}).left !== 'close') setOpen(false);
      if (v.mount) v.mount(shell.content);
    } else {
      shell = null;
      const back = v.back ? '<a class="round" href="' + v.back + '" aria-label="Back">' + icon('left') + '</a>' : '';
      root.innerHTML = '<div class="solo' + (layout === 'parent' ? ' is-parent' : '') + '">' +
        '<header class="solo-top">' + back + (layout === 'parent' ? '<span class="tag">Prototype: parent\'s view</span>' : '') + '</header>' +
        '<main class="solo-main"><div class="solo-content">' + v.html + '</div></main></div>';
      const c = root.querySelector('.solo-content');
      if (v.mount) v.mount(c);
    }
    const focus = root.querySelector('[autofocus]'); if (focus && !('ontouchstart' in window)) focus.focus();
  }

  applyTheme();
  window.addEventListener('hashchange', render);
  // Any click outside an open menu closes it.
  document.addEventListener('click', e => {
    document.querySelectorAll('.menu.is-open').forEach(m => { if (!m.contains(e.target)) { m.classList.remove('is-open'); const b = document.getElementById('profBtn'); if (b) b.setAttribute('aria-expanded', 'false'); } });
  });
  desktop.addEventListener('change', e => setOpen(e.matches));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && shell && shell.app.classList.contains('is-open') && !desktop.matches) setOpen(false); });
  window.EX.render = render;
  render();
})();
