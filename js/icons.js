/* ==========================================================================
   PLACEHOLDER ICONS. Hand-drawn stand-ins (24 x 24, 1.6 stroke, round caps).
   Swap each path for the final icon later: the names stay the same, so no
   screen code needs to change. Used only through icon('name') in ui.js.
   ========================================================================== */
(function () {
  'use strict';
  const P = {
    menu:       '<rect x="3.5" y="4.5" width="17" height="15" rx="4"/><path d="M9.5 4.5v15"/>',
    close:      '<path d="M6 6l12 12M18 6L6 18"/>',
    search:     '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    home:       '<path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-3.5v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19z"/>',
    subjects:   '<path d="M5 4.5h4.5v15H5zM9.5 4.5H14v15H9.5z"/><path d="M15.5 5.5l3.6-1 3 14.2-3.6 1z"/>',
    flashcards: '<rect x="3.5" y="7" width="13" height="13" rx="3"/><path d="M8 4h9.5A3 3 0 0 1 20.5 7v9.5"/>',
    quiz:       '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4"/><path d="M12 16.8v.2"/>',
    notes:      '<path d="M6.5 3.5h8l3.5 3.5v13.5h-11.5z"/><path d="M9.5 11h5M9.5 14.5h5M9.5 18h3"/>',
    papers:     '<path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14.5a1 1 0 0 1-1.5.9l-1.5-.9-1.5.9-1.5-.9-1.5.9-1.5-.9-1.5.9-1.5-.9V5A1.5 1.5 0 0 1 7 3.5z"/><path d="M9 8.5h6M9 12h6"/>',
    progress:   '<path d="M4 20h16"/><path d="M7 16.5v-4M12 16.5V7M17 16.5v-7"/>',
    settings:   '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6"/>',
    help:       '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M6 6l3.5 3.5M14.5 14.5L18 18M18 6l-3.5 3.5M9.5 14.5L6 18"/>',
    feedback:   '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-8l-4.5 3v-3H5A1.5 1.5 0 0 1 3.5 16V7A1.5 1.5 0 0 1 5 5.5z"/>',
    legal:      '<path d="M12 3.5l7 3v5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9v-5z"/>',
    logout:     '<path d="M14 4.5H7A1.5 1.5 0 0 0 5.5 6v12A1.5 1.5 0 0 0 7 19.5h7"/><path d="M11 12h9M17 8.5l3.5 3.5-3.5 3.5"/>',
    plan:       '<path d="M12 3.5l2.5 5.2 5.5.7-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.5-.7z"/>',
    school:     '<path d="M3 9.5L12 5l9 4.5-9 4.5z"/><path d="M7 11.5v4c1.3 1.3 3 2 5 2s3.7-.7 5-2v-4"/><path d="M21 9.5v5"/>',
    user:       '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    mail:       '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="M4.5 7.5l7.5 5.5 7.5-5.5"/>',
    lock:       '<rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    check:      '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cross:      '<path d="M7 7l10 10M17 7L7 17"/>',
    info:       '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
    right:      '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    left:       '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    arrow:      '<path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5"/>',
    external:   '<path d="M13.5 4.5h6v6M19.5 4.5L11 13"/><path d="M17.5 14v4.5A1.5 1.5 0 0 1 16 20H6a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 6 7h4.5"/>',
    more:       '<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="3"/>',
    trash:      '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    clock:      '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    refresh:    '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
    eye:        '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    copy:       '<rect x="8.5" y="8.5" width="11" height="11" rx="3"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
    key:        '<circle cx="8" cy="15" r="4"/><path d="M11 12l8.5-8.5M16.5 6.5l2.5 2.5"/>',
    card:       '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M3 10h18M7 15h3"/>',
    sun:        '<circle cx="12" cy="12" r="4"/><path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M5.6 18.4l1-1M17.4 6.6l1-1"/>',
    play:       '<path d="M8 5.5v13l10-6.5z"/>',
    google:     '<path d="M20 12.2c0-.6-.1-1.1-.2-1.7H12v3.2h4.5a4 4 0 0 1-1.7 2.6v2.1h2.8c1.6-1.5 2.4-3.7 2.4-6.2z"/><path d="M12 20.5c2.3 0 4.2-.8 5.6-2.1l-2.8-2.1c-.8.5-1.7.8-2.8.8-2.2 0-4-1.5-4.7-3.4H4.4v2.2a8.5 8.5 0 0 0 7.6 4.6z"/><path d="M7.3 13.7a5 5 0 0 1 0-3.4V8.1H4.4a8.5 8.5 0 0 0 0 7.8z"/><path d="M12 6.8c1.2 0 2.4.4 3.3 1.3l2.4-2.4A8.5 8.5 0 0 0 4.4 8.1l2.9 2.2C8 8.3 9.8 6.8 12 6.8z"/>'
  };

  // Each icon becomes a CSS variable used as a mask, so it takes the text colour.
  const css = Object.keys(P).map(n => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + P[n] + '</svg>';
    return '--i-' + n + ':url("data:image/svg+xml,' + encodeURIComponent(svg) + '");';
  }).join('');
  const style = document.createElement('style');
  style.textContent = ':root{' + css + '}';
  document.head.appendChild(style);
  window.EX_ICON_NAMES = Object.keys(P);
})();
