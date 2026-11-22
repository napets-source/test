/* ==========================================================================
   Study and revision screens: Home, Subjects, Subject, Topic, Flashcards,
   Quiz, Notes, Search, the three study entry pages, Past papers, Progress.
   ========================================================================== */
(function () {
  'use strict';
  const X = window.EX, { S, D, esc, icon, btn, row, lead, proTag, bar, head, section, route } = X;

  const MODES = {
    flashcards: { label: 'Flashcards', icon: 'flashcards', key: 'fc' },
    quiz: { label: 'Quiz', icon: 'quiz', key: 'quiz' },
    notes: { label: 'Notes', icon: 'notes', key: 'notes' }
  };
  const subj = (id) => D.SUBJECTS.find(s => s.id === id);
  const topicHref = (t) => '#/topic/' + t.id;
  const lockedRedirect = (t) => X.isLocked(t.chapter) ? { redirect: '#/pro' } : null;

  // A subject card: name, progress, what is next.
  function subjectCard(s) {
    const pct = X.subjectPct(s), nt = X.nextTopic(s);
    return '<a class="card subject" href="#/subject/' + s.id + '">' +
      '<div class="s-top"><span class="badge">' + s.letter + '</span><span class="s-name"><b>' + s.name + '</b>' +
      '<span class="sub">' + X.topicsDone(s) + ' of ' + X.allTopics(s).length + ' topics done</span></span><span class="s-pct">' + pct + '%</span></div>' +
      bar(pct) +
      '<div class="s-next">Next: <b>' + esc(nt.name) + '</b>' + icon('right', 's20') + '</div></a>';
  }
  // A topic row, with its own progress (0 to 3 activities done).
  function topicRow(t, i, mode) {
    const locked = X.isLocked(t.chapter), done = X.topicDone(t);
    const href = locked ? '#/pro' : mode ? '#/' + mode + '/' + t.id : topicHref(t);
    const ld = lead(locked ? icon('lock', 's16') : done === 3 ? icon('check', 's20') : String(i + 1), locked ? '' : done === 3 ? 'done' : '');
    const sub = locked ? 'Pro' : mode ? MODES[mode].label : done ? done + ' of 3 done' : 'Not started';
    return row({ href, lead: ld, title: t.name, sub, locked, end: locked ? proTag() : icon('right', 's20 faint') });
  }
  function chapterBlock(c, mode) {
    const locked = X.isLocked(c);
    return section('Chapter ' + (c.index + 1) + ' · ' + c.name, c.topics.map((t, i) => topicRow(t, i, mode)).join(''),
      locked ? '' : '');
  }

  /* ---------- Home ---------- */
  route('home', () => {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const last = S.history[0] && D.TOPICS[S.history[0].topic];
    const t = last || X.nextTopic(D.SUBJECTS[0]);
    const pct = X.topicPct(t);
    const hero = '<section class="hero" aria-label="Continue where you left off">' +
      '<div><p class="t-eyebrow">' + (last ? 'Continue where you left off' : 'Start here') + '</p>' +
      '<h2>' + esc(t.name) + '</h2><p>' + t.subject.name + ' · Chapter ' + (t.chapter.index + 1) + ', ' + esc(t.chapter.name) + '</p></div>' +
      bar(pct) +
      '<div class="row">' + btn(last ? 'Resume' : 'Start', { variant: 'on-accent', href: last ? '#/' + S.history[0].mode + '/' + t.id : topicHref(t), iconEnd: 'arrow' }) +
      '<a class="round on-accent" href="' + topicHref(t) + '" aria-label="Study options for this topic">' + icon('more') + '</a></div></section>';
    return {
      nav: 'home', title: 'Home',
      html: '<header class="page-head"><h1 class="t-display">' + greet + ', ' + esc(X.firstName()) + '</h1><p class="muted">Pick up where you left off, or choose a subject.</p></header>' +
        hero + section('Your subjects', D.SUBJECTS.map(subjectCard).join(''))
    };
  });

  /* ---------- Subjects ---------- */
  route('subjects', () => ({
    nav: 'subjects', title: 'Subjects',
    html: head({ title: 'Subjects', sub: 'Junior Cycle. All three subjects are always here.' }) + '<div class="list">' + D.SUBJECTS.map(subjectCard).join('') + '</div>' +
      (S.plan === 'free' ? X.note('On the Free plan, chapter 1 of every subject is open. <a href="#/pro">See what Pro includes</a>.', 'lock') : '')
  }));

  /* ---------- Subject: chapters and their topics ---------- */
  route('subject', (p) => {
    const s = subj(p[0]); if (!s) return { redirect: '#/subjects' };
    const pct = X.subjectPct(s);
    return {
      nav: 'subjects', title: s.name, top: { left: 'back', href: '#/subjects' },
      html: head({ eyebrow: 'Subject', title: s.name, sub: X.topicsDone(s) + ' of 9 topics done · ' + pct + '%' }) + bar(pct) +
        s.chapters.map(c => chapterBlock(c)).join('')
    };
  });

  /* ---------- Topic: three ways to study ---------- */
  route('topic', (p) => {
    const t = D.TOPICS[p[0]]; if (!t) return { redirect: '#/subjects' };
    const l = lockedRedirect(t); if (l) return l;
    const pr = S.progress[t.id] || {}, c = D.content(t);
    const opt = (mode, sub, done) => row({ href: '#/' + mode + '/' + t.id, lead: lead(icon(MODES[mode].icon, 's20'), done ? 'done' : ''), title: MODES[mode].label, sub,
      end: done ? '<span class="tag status success">' + icon('check', 's16') + 'Done</span>' : icon('right', 's20 faint') });
    return {
      nav: 'subjects', title: t.name, top: { left: 'back', href: '#/subject/' + t.subject.id },
      html: head({ eyebrow: t.subject.name + ' · Chapter ' + (t.chapter.index + 1), title: t.name, sub: X.topicDone(t) + ' of 3 done' }) +
        '<div class="list">' +
        opt('flashcards', c.cards.length + ' cards', pr.fc) +
        opt('quiz', c.quiz.length + ' questions' + (pr.quiz ? ' · best ' + pr.quiz.score + '/' + pr.quiz.total : ''), !!pr.quiz) +
        opt('notes', 'About 3 min read', pr.notes) + '</div>'
    };
  });

  /* ---------- Flashcards session ---------- */
  route('flashcards', (p, q) => {
    const t = D.TOPICS[p[0]];
    if (!t) return { redirect: '#/study/flashcards' };
    const l = lockedRedirect(t); if (l) return l;
    const all = D.content(t).cards.map((c, i) => ({ q: c[0], a: c[1], i }));
    const only = q.get('only'); // "Go again" with the ones you did not know
    const cards = only ? all.filter(c => only.split(',').indexOf(String(c.i)) >= 0) : all;
    return {
      nav: 'flashcards', title: 'Flashcards', top: { left: 'close', href: topicHref(t), title: t.name, search: false },
      html: '<div class="session" id="fcs"></div>',
      mount(el) {
        const box = el.querySelector('#fcs');
        let i = 0, flipped = false; const known = [], unknown = [];
        function card() {
          const c = cards[i];
          box.innerHTML = '<div class="session-progress"><span class="t-label muted">' + (i + 1) + ' of ' + cards.length + '</span>' + bar(Math.round(i / cards.length * 100)) + '</div>' +
            '<button type="button" class="fc' + (flipped ? ' is-flipped' : '') + '" id="fc" aria-live="polite" aria-label="Flashcard. Tap to show the answer">' +
            '<span class="fc-inner"><span class="fc-face front"><span class="t-eyebrow muted">Question</span><span class="t-h2">' + esc(c.q) + '</span><span class="hint">Tap to show the answer</span></span>' +
            '<span class="fc-face back"><span class="t-eyebrow">Answer</span><span class="t-h2">' + esc(c.a) + '</span></span></span></button>' +
            '<div class="session-actions" id="acts"></div>';
          box.querySelector('#fc').addEventListener('click', flip);
          acts();
        }
        // The buttons change once the answer is showing; the card itself just cross-fades.
        function acts() {
          const a = box.querySelector('#acts');
          a.innerHTML = flipped
            ? btn("Don't know", { variant: 'outline', id: 'no', icon: 'cross' }) + btn('Know', { id: 'yes', icon: 'check' })
            : btn('Show answer', { variant: 'secondary', id: 'flip', block: true });
          const f = a.querySelector('#flip'); if (f) f.addEventListener('click', flip);
          const y = a.querySelector('#yes'); if (y) y.addEventListener('click', () => next(true));
          const n = a.querySelector('#no'); if (n) n.addEventListener('click', () => next(false));
        }
        function flip() { flipped = !flipped; box.querySelector('#fc').classList.toggle('is-flipped', flipped); acts(); }
        function next(k) {
          (k ? known : unknown).push(cards[i].i);
          i++; flipped = false;
          if (i < cards.length) card(); else done();
        }
        function done() {
          X.prog(t.id).fc = true; X.record(t, 'flashcards'); X.save();
          box.innerHTML = '<div class="result">' + X.logoMark(56) + '<h1 class="t-h1">Deck finished</h1>' +
            '<p class="muted">You knew ' + known.length + ' of ' + cards.length + ' cards.</p>' +
            '<div class="stats"><div class="stat"><b class="serif">' + known.length + '</b><span>Know</span></div><div class="stat"><b class="serif">' + unknown.length + '</b><span>Don\'t know</span></div></div>' +
            '<div class="list">' +
            (unknown.length ? btn('Go again with the ' + unknown.length + ' you didn\'t know', { href: '#/flashcards/' + t.id + '?only=' + unknown.join(','), block: true }) : '') +
            btn('Restart the deck', { variant: unknown.length ? 'secondary' : 'primary', href: '#/flashcards/' + t.id + '?r=' + Date.now(), block: true }) +
            btn('Back to topic', { variant: 'ghost', href: topicHref(t), block: true }) + '</div></div>';
        }
        card();
      }
    };
  });

  /* ---------- Quiz session: multiple choice, typed, match ---------- */
  route('quiz', (p) => {
    const t = D.TOPICS[p[0]];
    if (!t) return { redirect: '#/study/quiz' };
    const l = lockedRedirect(t); if (l) return l;
    const qs = D.content(t).quiz;
    return {
      nav: 'quizzes', title: 'Quiz', top: { left: 'close', href: topicHref(t), title: t.name, search: false },
      html: '<div class="session" id="qz"></div>',
      mount(el) {
        const box = el.querySelector('#qz');
        let i = 0; const results = [];
        const fb = (ok, why) => '<div class="feedback show ' + (ok ? 'is-ok' : 'is-bad') + '" role="status">' + icon(ok ? 'check' : 'cross') +
          '<div><b>' + (ok ? 'Correct' : 'Not quite') + '</b><p class="t-small">' + esc(why) + '</p></div></div>';
        const nextBtn = () => btn(i + 1 < qs.length ? 'Next question' : 'See results', { id: 'next', block: true, iconEnd: 'arrow' });
        function frame(inner) {
          const q = qs[i];
          const kind = { mc: 'Multiple choice', typed: 'Type your answer', match: 'Match the pairs' }[q.type];
          box.innerHTML = '<div class="session-progress"><span class="t-label muted">Question ' + (i + 1) + ' of ' + qs.length + ' · ' + kind + '</span>' + bar(Math.round(i / qs.length * 100)) + '</div>' +
            '<h1 class="t-h2">' + esc(q.q) + '</h1>' + inner + '<div class="fb-slot"></div><div class="session-actions" id="acts"></div>';
        }
        function finish(ok) {
          results.push(ok);
          box.querySelector('.fb-slot').innerHTML = fb(ok, qs[i].why);
          box.querySelector('#acts').innerHTML = nextBtn();
          box.querySelector('#next').addEventListener('click', () => { i++; i < qs.length ? show() : done(); });
        }
        function show() {
          const q = qs[i];
          if (q.type === 'mc') {
            frame('<div class="list" role="radiogroup">' + q.options.map((o, k) => '<button type="button" class="opt" role="radio" aria-checked="false" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span>' +
              '<span class="tagt"></span></button>').join('') + '</div>');
            const acts = box.querySelector('#acts');
            acts.innerHTML = btn('Check', { id: 'check', block: true, attrs: ' disabled' });
            let sel = null;
            box.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
              box.querySelectorAll('.opt').forEach(x => { x.classList.toggle('is-selected', x === b); x.setAttribute('aria-checked', String(x === b)); });
              sel = +b.dataset.k; box.querySelector('#check').disabled = false;
            }));
            box.querySelector('#check').addEventListener('click', () => {
              box.querySelectorAll('.opt').forEach(b => {
                const k = +b.dataset.k; b.disabled = true; b.classList.remove('is-selected');
                if (k === q.answer) { b.classList.add('is-correct'); b.querySelector('.tagt').innerHTML = icon('check', 's16') + 'Correct'; }
                else if (k === sel) { b.classList.add('is-wrong'); b.querySelector('.tagt').innerHTML = icon('cross', 's16') + 'Your answer'; }
              });
              finish(sel === q.answer);
            });
          } else if (q.type === 'typed') {
            frame(X.field({ id: 'ans', label: 'Your answer', attrs: ' autocomplete="off" autocapitalize="off" spellcheck="false" autofocus' }));
            const acts = box.querySelector('#acts');
            acts.innerHTML = btn('Check', { id: 'check', block: true });
            const inp = box.querySelector('#ans');
            const check = () => {
              if (!inp.value.trim()) { X.fieldError(inp, 'Type an answer first'); return; }
              const ok = q.accept.some(a => X.normalise(a) === X.normalise(inp.value));
              inp.disabled = true; X.fieldError(inp, '');
              inp.closest('.field').insertAdjacentHTML('beforeend', ok ? '' : '<p class="help">Answer: <b>' + esc(q.accept[0]) + '</b></p>');
              finish(ok);
            };
            box.querySelector('#check').addEventListener('click', check);
            inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !inp.disabled) check(); });
          } else {
            // Match: tap a term, then its meaning. Right pairs lock in; a wrong pair counts as a mistake.
            const right = q.pairs.map((pp, k) => ({ v: pp[1], k })).sort(() => Math.random() - .5);
            frame('<p class="t-small muted">Tap a word on the left, then its match on the right.</p><div class="match">' +
              '<div class="list">' + q.pairs.map((pp, k) => '<button type="button" class="opt m-l" data-k="' + k + '"><span>' + esc(pp[0]) + '</span></button>').join('') + '</div>' +
              '<div class="list">' + right.map(r => '<button type="button" class="opt m-r" data-k="' + r.k + '"><span>' + esc(r.v) + '</span></button>').join('') + '</div></div>');
            let pick = null, matched = 0, mistakes = 0;
            box.querySelectorAll('.m-l').forEach(b => b.addEventListener('click', () => {
              box.querySelectorAll('.m-l').forEach(x => x.classList.toggle('is-selected', x === b)); pick = b;
            }));
            box.querySelectorAll('.m-r').forEach(b => b.addEventListener('click', () => {
              if (!pick) return;
              if (pick.dataset.k === b.dataset.k) {
                [pick, b].forEach(x => { x.classList.remove('is-selected'); x.classList.add('is-correct'); x.disabled = true; });
                pick = null; matched++;
                if (matched === q.pairs.length) finish(mistakes === 0);
              } else {
                mistakes++; b.classList.add('is-wrong'); pick.classList.add('is-wrong');
                const a = pick; setTimeout(() => { a.classList.remove('is-wrong', 'is-selected'); b.classList.remove('is-wrong'); }, 600); pick = null;
              }
            }));
          }
        }
        function done() {
          const score = results.filter(Boolean).length;
          const pr = X.prog(t.id); if (!pr.quiz || score > pr.quiz.score) pr.quiz = { score, total: qs.length };
          X.record(t, 'quiz'); X.save();
          box.innerHTML = '<div class="result">' + X.logoMark(56) + '<h1 class="t-h1">Quiz finished</h1><p class="muted">You got ' + score + ' of ' + qs.length + ' right.</p>' +
            '<div class="list">' + qs.map((q, k) => X.row({ lead: lead(icon(results[k] ? 'check' : 'cross', 's20'), results[k] ? 'done' : 'bad'), title: q.q, sub: results[k] ? 'Correct' : 'Wrong' })).join('') + '</div>' +
            '<div class="list">' + btn('Try again', { href: '#/quiz/' + t.id + '?r=' + Date.now(), block: true, icon: 'refresh' }) + btn('Back to topic', { variant: 'ghost', href: topicHref(t), block: true }) + '</div></div>';
        }
        show();
      }
    };
  });

  /* ---------- Revision notes ---------- */
  route('notes', (p) => {
    const t = D.TOPICS[p[0]];
    if (!t) return { redirect: '#/study/notes' };
    const l = lockedRedirect(t); if (l) return l;
    return {
      nav: 'notes', title: 'Notes', top: { left: 'back', href: topicHref(t) },
      html: head({ eyebrow: t.subject.name + ' · Revision notes', title: t.name }) +
        '<article class="card prose">' + D.content(t).note.map(n => '<h2 class="t-h3">' + esc(n[0]) + '</h2><p>' + esc(n[1]) + '</p>').join('') + '</article>' +
        '<div class="list">' + btn('Test yourself with the quiz', { href: '#/quiz/' + t.id, block: true, iconEnd: 'arrow' }) + btn('Back to topic', { variant: 'ghost', href: topicHref(t), block: true }) + '</div>',
      mount() { X.prog(t.id).notes = true; X.record(t, 'notes'); X.save(); }
    };
  });

  /* ---------- Study entry pages: Flashcards, Quizzes, Notes in the sidebar ---------- */
  // Pick a subject, then a topic, and go straight into that mode. (A/B test later vs reaching it only through Subjects.)
  ['flashcards', 'quiz', 'notes'].forEach(mode => {
    route('study/' + mode, (p) => {
      const s = subj(p[0]) || D.SUBJECTS[0];
      const label = mode === 'quiz' ? 'Quizzes' : MODES[mode].label;
      return {
        nav: mode === 'quiz' ? 'quizzes' : mode, title: label,
        html: head({ title: label, sub: 'Choose a subject, then a topic.' }) +
          '<div class="chips" role="tablist">' + D.SUBJECTS.map(x => '<a class="chip' + (x === s ? ' is-on' : '') + '" role="tab" aria-selected="' + (x === s) + '" href="#/study/' + mode + '/' + x.id + '">' + x.name + '</a>').join('') + '</div>' +
          s.chapters.map(c => chapterBlock(c, mode)).join('')
      };
    });
  });

  /* ---------- Search ---------- */
  route('search', () => ({
    title: 'Search', top: { left: 'back', href: '#/home', search: false },
    html: '<div class="search"><i class="ic" style="--i:var(--i-search)"></i><input class="input" id="q" type="search" placeholder="Search subjects, chapters and topics" aria-label="Search" autocomplete="off" autofocus></div><div id="res"></div>',
    mount(el) {
      const inp = el.querySelector('#q'), res = el.querySelector('#res');
      const items = [];
      D.SUBJECTS.forEach(s => {
        items.push({ kind: 'Subjects', name: s.name, sub: 'Subject', href: '#/subject/' + s.id });
        s.chapters.forEach(c => {
          items.push({ kind: 'Chapters', name: c.name, sub: s.name + ' · Chapter ' + (c.index + 1), href: '#/subject/' + s.id, locked: X.isLocked(c) });
          c.topics.forEach(t => items.push({ kind: 'Topics', name: t.name, sub: s.name + ' · ' + c.name, href: X.isLocked(c) ? '#/pro' : topicHref(t), locked: X.isLocked(c) }));
        });
      });
      function draw() {
        const v = X.normalise(inp.value);
        if (!v) { res.innerHTML = '<p class="empty muted">Try "fractions", "poetry" or "aimsir".</p>'; return; }
        const hits = items.filter(it => X.normalise(it.name + ' ' + it.sub).indexOf(v) >= 0);
        if (!hits.length) { res.innerHTML = '<p class="empty muted">Nothing found for "' + esc(inp.value) + '".</p>'; return; }
        res.innerHTML = ['Subjects', 'Chapters', 'Topics'].map(k => {
          const h = hits.filter(x => x.kind === k); if (!h.length) return '';
          return section(k, h.map(it => row({ href: it.href, title: it.name, sub: it.sub, locked: it.locked, end: it.locked ? proTag() : icon('right', 's20 faint') })).join(''));
        }).join('');
      }
      inp.addEventListener('input', draw); draw();
    }
  }));

  /* ---------- Past papers: links out to the SEC ---------- */
  route('papers', (p, q) => {
    const s = subj(q.get('s')) || D.SUBJECTS[0], lv = q.get('l') || D.PAPER_LEVELS[0];
    return {
      nav: 'papers', title: 'Past papers',
      html: head({ title: 'Past papers', sub: 'Junior Cycle papers from the State Examinations Commission. They open on the SEC website.' }) +
        '<div class="chips">' + D.SUBJECTS.map(x => '<a class="chip' + (x === s ? ' is-on' : '') + '" href="#/papers?s=' + x.id + '&l=' + lv + '">' + x.name + '</a>').join('') + '</div>' +
        X.seg('lvl', D.PAPER_LEVELS.map(l => [l, l]), lv) +
        section(s.name + ' · ' + lv, D.PAPER_YEARS.map(y => row({ href: D.SEC_URL, attrs: ' target="_blank" rel="noopener"', lead: lead(String(y).slice(2)), title: s.name + ' ' + y, sub: lv + ' level · Paper and marking scheme', end: icon('external', 's20 faint') })).join('')) +
        X.protoNote('Levels shown are placeholders until we check which Junior Cycle papers the SEC publishes (open). Links go to the SEC archive page.'),
      mount(el) { X.bindSeg(el, 'lvl', v => X.go('#/papers?s=' + s.id + '&l=' + v)); }
    };
  });

  /* ---------- Progress ---------- */
  route('progress', () => {
    const hist = S.history.slice(0, 6);
    return {
      nav: 'progress', title: 'Progress',
      html: head({ title: 'Progress', sub: 'How far you are in each subject.' }) +
        '<div class="list">' + D.SUBJECTS.map(s => { const pct = X.subjectPct(s); return '<a class="card subject" href="#/subject/' + s.id + '"><div class="s-top"><span class="badge">' + s.letter + '</span><span class="s-name"><b>' + s.name + '</b><span class="sub">' + X.topicsDone(s) + ' of 9 topics done</span></span><span class="s-pct">' + pct + '%</span></div>' + bar(pct) + '</a>'; }).join('') + '</div>' +
        section('Last studied', hist.length ? hist.map(h => { const t = D.TOPICS[h.topic]; return row({ href: '#/' + h.mode + '/' + t.id, lead: lead(icon(MODES[h.mode].icon, 's20')), title: t.name, sub: t.subject.name + ' · ' + MODES[h.mode].label + ' · ' + X.ago(h.at), end: icon('right', 's20 faint') }); }).join('')
          : '<p class="empty muted">Nothing yet. Start a topic and it will show here.</p>')
    };
  });

  route('notfound', () => ({ title: 'Not found', html: head({ title: 'Page not found', sub: 'That page does not exist in the prototype.' }) + btn('Go home', { href: '#/home' }) }));
})();
