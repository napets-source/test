/* ==========================================================================
   Money, settings, legal and help screens, plus the prototype screen map.
   Payments are mocked; the real build hands over to Stripe Checkout.
   ========================================================================== */
(function () {
  'use strict';
  const X = window.EX, { S, flow, esc, icon, btn, row, lead, head, section, field, route, go } = X;
  const PRICE = { monthly: '€4.99', yearly: '€39.99' };
  const PER = { monthly: 'a month', yearly: 'a year' };
  const under18 = () => S.band !== '18+';
  // Pages reachable signed out (legal) use the plain layout then.
  const flexi = (v, back) => S.auth ? v : Object.assign(v, { layout: 'solo', back: back || '#/welcome' });
  const chevron = icon('right', 's20 faint');

  /* ---------- Pro page (no popups: locked chapters link here) ---------- */
  route('pro', (p, q) => {
    if (S.plan !== 'free') return { redirect: '#/plan' };
    const cycle = q.get('c') || S.cycle;
    const line = (t, on) => '<li>' + icon(on ? 'check' : 'cross', 's20' + (on ? '' : ' faint')) + '<span' + (on ? '' : ' class="muted"') + '>' + t + '</span></li>';
    const cta = under18()
      ? btn('Ask a parent or guardian to pay', { href: '#/ask-parent?c=' + cycle, block: true, icon: 'mail' })
      : btn('Continue to payment', { href: '#/checkout?c=' + cycle, block: true, iconEnd: 'arrow' });
    return {
      title: 'Pro', top: { left: 'back', href: '#/home' },
      html: head({ eyebrow: 'Examinise Pro', title: 'Every chapter, every subject', sub: 'Free opens chapter 1 of each subject. Pro opens everything.' }) +
        X.seg('cycle', [['monthly', 'Monthly'], ['yearly', 'Yearly']], cycle) +
        '<div class="plans">' +
          '<div class="card plan-card"><p class="t-eyebrow muted">Free</p><p class="price serif">€0</p><ul class="ticks">' + line('Chapter 1 of each subject', true) + line('Flashcards, quizzes and notes', true) + line('Past paper links', true) + line('Every other chapter', false) + '</ul></div>' +
          '<div class="card plan-card is-pick"><p class="t-eyebrow">Pro</p><p class="price serif">' + PRICE[cycle] + ' <small>' + PER[cycle] + '</small></p>' +
            (cycle === 'yearly' ? '<span class="tag">Save about a third</span>' : '') +
            '<ul class="ticks">' + line('Every chapter in Maths, English and Irish', true) + line('Flashcards, quizzes and notes', true) + line('Past paper links', true) + line('No ads, ever', true) + '</ul></div>' +
        '</div>' + cta +
        '<p class="t-small muted center">' + (cycle === 'yearly' ? 'Runs 12 months from the day you buy. ' : 'Billed every month. ') + 'Cancel any time.</p>' +
        btn('I have a school code', { variant: 'ghost', href: '#/plan-code', block: true, icon: 'school' }),
      mount(el) { X.bindSeg(el, 'cycle', v => { S.cycle = v; X.save(); go('#/pro?c=' + v); }); }
    };
  });

  /* ---------- Checkout (stand-in for Stripe's own hosted page) ---------- */
  route('checkout', (p, q) => {
    const parent = p[0] === 'parent';
    const cycle = parent ? (S.payRequest || {}).cycle || 'yearly' : (q && q.get('c')) || S.cycle;
    return {
      layout: parent ? 'parent' : 'solo', title: 'Checkout', back: parent ? '#/parent/pay-email' : '#/pro',
      html: '<header class="solo-head"><span class="tag">Stripe Checkout (stand-in)</span><h1 class="t-h1">Examinise Pro</h1><p class="muted">' + (parent ? 'For ' + esc(S.user.name) : esc(S.user.email)) + '</p></header>' +
        '<div class="card"><div class="kv"><span>Pro, ' + (cycle === 'yearly' ? 'yearly' : 'monthly') + '</span><b>' + PRICE[cycle] + '</b></div><div class="kv muted t-small"><span>Renews</span><span>' + (cycle === 'yearly' ? 'Every 12 months' : 'Every month') + '</span></div></div>' +
        X.note('In the real app this is Stripe\'s own secure page. Card details never touch Examinise.', 'card') +
        btn('Pay ' + PRICE[cycle], { id: 'pay', block: true }) + btn('Cancel', { variant: 'ghost', href: parent ? '#/parent/pay-email' : '#/pro', block: true }),
      mount(el) {
        el.querySelector('#pay').addEventListener('click', e => {
          e.currentTarget.classList.add('is-loading');
          setTimeout(() => {
            const d = new Date(); cycle === 'yearly' ? d.setFullYear(d.getFullYear() + 1) : d.setMonth(d.getMonth() + 1);
            Object.assign(S, { plan: 'pro', cycle, renews: d.toISOString(), payRequest: null }); X.save();
            go(parent ? '#/parent/paid' : '#/pro-welcome');
          }, 900);
        });
      }
    };
  });
  // Parent's confirmation after paying
  const parentRoute = X.ROUTES.parent;
  route('parent', (p) => p[0] === 'paid' ? {
    layout: 'parent', title: 'Paid',
    html: '<header class="solo-head">' + X.logoMark(48) + '<h1 class="t-h1">Payment done</h1><p class="muted">' + esc(X.firstName()) + ' now has Pro. A receipt with a cancel link is on its way to you.</p></header>' +
      btn('Prototype: back to the student\'s app', { variant: 'secondary', href: '#/home', block: true })
  } : parentRoute(p));

  route('pro-welcome', () => ({
    title: 'Pro', top: { left: 'menu' },
    html: '<div class="result">' + X.logoMark(56) + '<h1 class="t-h1">You\'re on Pro</h1><p class="muted">Every chapter is open now.</p>' +
      btn('Start studying', { href: '#/subjects', block: true }) + btn('See my plan', { variant: 'ghost', href: '#/plan', block: true }) + '</div>'
  }));

  /* ---------- Ask a parent to pay (under 18) ---------- */
  route('ask-parent', (p, q) => {
    const r = S.payRequest;
    if (r) return {
      title: 'Asked a parent', top: { left: 'back', href: '#/home' },
      html: head({ title: 'Request sent', sub: 'We emailed ' + r.email + ' a payment link. Pro opens as soon as they pay.' }) +
        '<div class="card status-card">' + icon('clock') + '<div><b>Waiting for payment</b><p class="t-small muted">Pro, ' + r.cycle + ' · ' + PRICE[r.cycle] + '</p></div></div>' +
        '<div class="list">' + btn('Send the email again', { variant: 'secondary', id: 'again', block: true, icon: 'refresh' }) + btn('Cancel the request', { variant: 'ghost', id: 'cancel', block: true }) + '</div>' +
        X.protoNote('<a href="#/parent/pay-email">Open the parent\'s email</a> to pay as the parent.'),
      mount(el) {
        el.querySelector('#again').addEventListener('click', () => X.toast('Email sent again'));
        el.querySelector('#cancel').addEventListener('click', () => { S.payRequest = null; X.save(); go('#/pro'); });
      }
    };
    const cycle = q.get('c') || S.cycle;
    return {
      title: 'Ask a parent', top: { left: 'back', href: '#/pro' },
      html: head({ title: 'Ask a parent or guardian', sub: 'We will email them a secure payment link. They do not need an account.' }) +
        X.seg('cycle', [['monthly', 'Monthly · €4.99'], ['yearly', 'Yearly · €39.99']], cycle) +
        '<form class="form" id="f" novalidate>' + field({ id: 'pe', label: 'Their email', type: 'email', value: S.parentEmail, placeholder: 'parent@example.com' }) +
        btn('Send the request', { block: true, attrs: ' type="submit"' }) + '</form>' +
        X.note('The parent pays and can cancel at any time from the link in their emails. You will see the plan status here.'),
      mount(el) {
        let c = cycle; X.bindSeg(el, 'cycle', v => { c = v; });
        el.querySelector('#f').addEventListener('submit', e => {
          e.preventDefault(); const m = el.querySelector('#pe');
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value);
          X.fieldError(m, ok ? '' : 'Enter a valid email address');
          if (!ok) return;
          S.parentEmail = m.value.trim(); S.payRequest = { email: S.parentEmail, cycle: c }; X.save(); go('#/ask-parent');
        });
      }
    };
  });

  /* ---------- Manage plan ---------- */
  route('plan', () => {
    const kv = (k, v) => '<div class="kv"><span class="muted">' + k + '</span><b>' + v + '</b></div>';
    let body;
    if (S.plan === 'free') body = '<div class="card">' + kv('Plan', 'Free') + kv('Open', 'Chapter 1 of each subject') + '</div>' + btn('See Pro', { href: '#/pro', block: true }) +
      (S.payRequest ? X.note('You asked ' + esc(S.payRequest.email) + ' to pay. <a href="#/ask-parent">See the request</a>.', 'clock') : '');
    else if (S.plan === 'school') body = '<div class="card">' + kv('Plan', 'Pro, through your school') + kv('School', esc(S.school || 'Sample Community School')) + '</div>' +
      X.note('Your school manages this plan. If the school\'s seats end, your account moves to Free and keeps your progress.', 'school');
    else body = '<div class="card">' + kv('Plan', 'Pro, ' + S.cycle) + kv('Price', PRICE[S.cycle] + ' ' + PER[S.cycle]) + kv('Renews', S.renews ? X.fmtDate(S.renews) : 'Not set') + '</div>' +
      (under18()
        ? X.note('Your parent or guardian pays for this plan. They can change or cancel it from the link in any Examinise payment email.', 'user')
        : btn('Cancel plan', { variant: 'danger', id: 'cancel', block: true }) + '<p class="t-small muted center">You keep Pro until the end of the period you paid for.</p>');
    return {
      title: 'Plan', top: { left: 'back', href: '#/settings' },
      html: head({ title: 'Your plan' }) + body,
      mount(el) {
        const c = el.querySelector('#cancel'); if (!c) return;
        c.addEventListener('click', () => {
          const d = X.dialog('<h2 class="t-h2">Cancel Pro?</h2><p class="muted">Pro stays on until ' + X.fmtDate(S.renews) + '. After that you move to Free and keep your progress.</p>' +
            '<div class="dlg-actions">' + btn('Keep Pro', { variant: 'secondary', attrs: ' data-close' }) + btn('Cancel plan', { variant: 'danger', id: 'yes' }) + '</div>');
          d.querySelector('#yes').addEventListener('click', () => { S.plan = 'free'; S.renews = null; X.save(); d.close(); X.toast('Plan cancelled'); go('#/plan'); });
        });
      }
    };
  });

  // Signed-in student adding a school code from the Pro page
  route('plan-code', () => ({
    title: 'School code', top: { left: 'back', href: '#/pro' },
    html: head({ title: 'Add a school code', sub: 'Your school gives you this code.' }) +
      '<form class="form" id="f" novalidate>' + field({ id: 'sc', label: 'School code', placeholder: 'SCHOOL20', attrs: ' autocapitalize="characters" autocomplete="off" spellcheck="false"' }) + btn('Add code', { block: true, attrs: ' type="submit"' }) + '</form>' +
      X.protoNote('Use <b>SCHOOL20</b>.') + '<p class="t-small muted center">A school, not a student? <a href="#/school-request">Request seats for your school</a></p>',
    mount(el) {
      const inp = el.querySelector('#sc');
      inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase(); });
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault();
        if (inp.value.trim() !== 'SCHOOL20') { X.fieldError(inp, 'That code is not valid, or the school has no seats left.'); return; }
        Object.assign(S, { plan: 'school', school: 'Sample Community School' }); X.save(); X.toast('School code added'); go('#/plan');
      });
    }
  }));

  /* ---------- School seat request (schools are set up by hand in v1) ---------- */
  route('school-request', () => flexi({
    title: 'For schools', top: { left: 'back', href: '#/help' },
    html: head({ eyebrow: 'For schools', title: 'Request seats', sub: 'From about 20 seats. We set up your school and send you a join code for students.' }) +
      '<form class="form" id="f" novalidate>' + field({ id: 'sn', label: 'School name' }) + field({ id: 'cn', label: 'Your name' }) +
      field({ id: 'ce', label: 'Work email', type: 'email' }) + field({ id: 'seats', label: 'How many seats', type: 'number', value: '20', attrs: ' min="20" inputmode="numeric"' }) +
      btn('Send request', { block: true, attrs: ' type="submit"' }) + '</form>' +
      X.protoNote('Seat prices are still being worked out (€29.99 per seat per year for 20 to 80 seats is the working number).'),
    mount(el) {
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault();
        const req = ['#sn', '#cn', '#ce'].map(s => el.querySelector(s)); let bad = false;
        req.forEach(i => { const empty = !i.value.trim(); X.fieldError(i, empty ? 'Fill this in' : ''); bad = bad || empty; });
        if (bad) return;
        X.toast('Request sent. We will be in touch.'); go(S.auth ? '#/help' : '#/welcome');
      });
    }
  }, '#/welcome'));

  /* ---------- Settings ---------- */
  route('settings', () => {
    const r = (id, ic, title, sub) => row({ button: true, attrs: ' data-edit="' + id + '"', lead: lead(icon(ic, 's20')), title, sub, end: chevron });
    const planSub = S.plan === 'pro' ? 'Pro, ' + S.cycle : S.plan === 'school' ? 'Pro through your school' : 'Free';
    return {
      title: 'Settings',
      html: head({ title: 'Settings' }) +
        section('Account', r('name', 'user', 'Name', S.user.name) + r('email', 'mail', 'Email', S.user.email) + r('pw', 'key', 'Password', 'Change your password') +
          row({ href: '#/plan', lead: lead(icon('plan', 's20')), title: 'Plan', sub: planSub, end: chevron })) +
        section('Appearance', '<div class="card setting"><span class="setting-l">' + icon('sun', 's20') + '<span>Theme</span></span>' + X.seg('theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], S.theme) + '</div>') +
        section('Danger zone', row({ href: '#/delete-account', lead: lead(icon('trash', 's20'), 'bad'), title: 'Delete my account', sub: 'Removes your account and progress for good', end: chevron })),
      mount(el) {
        X.bindSeg(el, 'theme', v => { S.theme = v; X.save(); X.applyTheme(); });
        el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => edit(b.dataset.edit)));
      }
    };
  });
  function edit(what) {
    const forms = {
      name: ['Change your name', field({ id: 'v', label: 'Name', value: S.user.name, attrs: ' autocomplete="name"' }), 'Save'],
      email: ['Change your email', field({ id: 'v', label: 'New email', type: 'email', value: '', placeholder: S.user.email }) + '<p class="t-small muted">We will send a 6-digit code to the new address.</p>', 'Send code'],
      pw: ['Change your password', field({ id: 'cur', label: 'Current password', type: 'password' }) + field({ id: 'v', label: 'New password', type: 'password', help: 'At least 8 characters' }), 'Save']
    };
    const [title, body, cta] = forms[what];
    const d = X.dialog('<form method="dialog" class="form" id="ef" novalidate><h2 class="t-h2">' + title + '</h2>' + body +
      '<div class="dlg-actions">' + btn('Cancel', { variant: 'ghost', attrs: ' data-close' }) + btn(cta, { attrs: ' type="submit"' }) + '</div></form>');
    d.querySelector('#ef').addEventListener('submit', e => {
      e.preventDefault(); const v = d.querySelector('#v');
      if (what === 'name') { if (!v.value.trim()) return X.fieldError(v, 'Enter your name'); S.user.name = v.value.trim(); X.save(); d.close(); X.toast('Name saved'); go('#/settings'); }
      if (what === 'email') { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.value)) return X.fieldError(v, 'Enter a valid email address'); flow.newEmail = v.value.trim(); d.close(); go('#/verify?for=email'); }
      if (what === 'pw') { const c = d.querySelector('#cur'); X.fieldError(c, c.value ? '' : 'Enter your current password'); if (!c.value) return; if (v.value.length < 8) return X.fieldError(v, 'Use at least 8 characters'); d.close(); X.toast('Password changed'); }
    });
  }

  /* ---------- Delete account ---------- */
  route('delete-account', () => ({
    title: 'Delete account', top: { left: 'back', href: '#/settings' },
    html: head({ title: 'Delete your account', sub: 'This removes your account, your progress and your age group from Examinise. It cannot be undone.' }) +
      (S.plan === 'pro' && !under18() ? X.note('Your Pro plan will be cancelled too. No more payments will be taken.', 'info') : '') +
      (S.plan === 'pro' && under18() ? X.note('Your parent or guardian will get an email that the paid plan has been cancelled.', 'info') : '') +
      '<label class="tick"><input type="checkbox" id="ok"><span class="box"><svg viewBox="0 0 24 24"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span>I understand this cannot be undone</span></label>' +
      '<div class="list">' + btn('Delete my account', { variant: 'danger', id: 'del', block: true, attrs: ' disabled' }) + btn('Keep my account', { variant: 'ghost', href: '#/settings', block: true }) + '</div>',
    mount(el) {
      const ok = el.querySelector('#ok'), del = el.querySelector('#del');
      ok.addEventListener('change', () => { del.disabled = !ok.checked; });
      del.addEventListener('click', () => { X.reset(); S.auth = false; X.save(); go('#/goodbye'); });
    }
  }));
  route('goodbye', () => ({
    layout: 'solo', title: 'Account deleted',
    html: '<header class="solo-head">' + X.logoMark(48) + '<h1 class="t-h1">Your account is deleted</h1><p class="muted">Everything has been removed. Thanks for trying Examinise.</p></header>' + btn('Back to the start', { href: '#/welcome', block: true })
  }));

  /* ---------- Legal (one page, two links) ---------- */
  route('legal', () => flexi({
    title: 'Legal', top: { left: 'back', href: '#/settings' },
    html: head({ title: 'Legal' }) + '<div class="list">' +
      row({ href: '#/legal/terms', title: 'Terms of Service', end: icon('arrow', 's20') }) + row({ href: '#/legal/privacy', title: 'Privacy Policy', end: icon('arrow', 's20') }) + '</div>' +
      X.protoNote('Layout to be decided later. Both documents need a legal review before launch.')
  }));
  const doc = (title, parts) => '<article class="card prose">' + parts.map(p => '<h2 class="t-h3">' + p[0] + '</h2><p>' + p[1] + '</p>').join('') + '</article>';
  route('legal/terms', () => flexi({
    title: 'Terms', top: { left: 'back', href: '#/legal' },
    html: head({ eyebrow: 'Placeholder', title: 'Terms of Service' }) + doc('Terms', [
      ['Who we are', 'Examinise is a study app for Irish secondary school students. These terms are placeholder text.'],
      ['Your account', 'You need to be 12 or older. Under 16s need a parent or guardian to approve, unless they join with a school code.'],
      ['Plans and payment', 'Pro costs €4.99 a month or €39.99 a year. You can cancel at any time.'],
      ['Content', 'All study content is made and checked by us. Past papers link to the State Examinations Commission.']])
  }, '#/legal'));
  route('legal/privacy', () => flexi({
    title: 'Privacy', top: { left: 'back', href: '#/legal' },
    html: head({ eyebrow: 'Placeholder', title: 'Privacy Policy' }) + doc('Privacy', [
      ['Our promise', 'No ads. We never sell or share your data. No trackers or analytics that share data.'],
      ['What we keep', 'Your name, email, age group (never your date of birth), study progress and, for under 16s, a record of parent approval.'],
      ['Cookies', 'Only the cookies needed to keep you logged in. (Cookie decision still open.)'],
      ['Deleting your data', 'You can delete your account at any time from Settings.']])
  }, '#/legal'));

  /* ---------- Help and feedback ---------- */
  route('help', () => {
    const faq = [['What is free?', 'Chapter 1 of every subject, with its flashcards, quizzes and notes, and all the past paper links.'],
      ['How do I get Pro?', 'From the Pro page. If you are under 18, a parent or guardian pays by email link.'],
      ['My parent did not get the email', 'Check their spam folder, then use "Resend the email" on the waiting screen.'],
      ['Can I use Examinise on a computer?', 'Yes, in any browser.']];
    return {
      title: 'Help',
      html: head({ title: 'Help' }) + '<div class="list">' + faq.map(f => '<details class="card faq"><summary><b>' + f[0] + '</b>' + icon('right', 's20') + '</summary><p class="muted">' + f[1] + '</p></details>').join('') + '</div>' +
        section('Still stuck?', row({ href: '#/feedback', lead: lead(icon('feedback', 's20')), title: 'Send us a message', end: chevron }) +
          row({ href: '#/school-request', lead: lead(icon('school', 's20')), title: 'For schools', sub: 'Request seats', end: chevron }))
    };
  });
  route('feedback', () => ({
    title: 'Feedback',
    html: head({ title: 'Feedback', sub: 'Found a mistake or have an idea? It goes straight to the person who makes Examinise.' }) +
      '<form class="form" id="f" novalidate><div class="field"><label for="msg">Your message</label><textarea class="input" id="msg" rows="6"></textarea><p class="help err" hidden></p></div>' +
      btn('Send', { block: true, attrs: ' type="submit"' }) + '</form>' +
      X.protoNote('Should-have for v1. Until it is built, Feedback can be a simple email link.'),
    mount(el) {
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault(); const m = el.querySelector('#msg');
        X.fieldError(m, m.value.trim() ? '' : 'Write a message first'); if (!m.value.trim()) return;
        m.value = ''; X.toast('Thanks, message sent');
      });
    }
  }));

  /* ---------- Desktop and tablet notice ---------- */
  route('desktop-notice', () => ({
    layout: 'solo', title: 'Coming soon', back: '#/map',
    html: '<header class="solo-head">' + X.logoMark(56) + '<h1 class="t-h1">Desktop and tablet are on the way</h1><p class="muted">Examinise works best on your phone for now. Open it there, or keep going here while we finish the bigger layouts.</p></header>' +
      btn('Continue anyway', { href: '#/home', block: true, variant: 'secondary' })
  }));

  /* ---------- Prototype: every screen, plus state switches ---------- */
  route('map', () => {
    const G = [
      ['Study', [['Home', '#/home'], ['Subjects', '#/subjects'], ['Subject (Maths)', '#/subject/maths'], ['Topic', '#/topic/maths-0-0'], ['Flashcards', '#/flashcards/maths-0-0'], ['Quiz', '#/quiz/maths-0-0'], ['Quiz (Irish, typed answers with fadas)', '#/quiz/irish-0-0'], ['Notes', '#/notes/maths-0-0'], ['Search', '#/search'], ['Flashcards entry', '#/study/flashcards'], ['Quizzes entry', '#/study/quiz'], ['Notes entry', '#/study/notes']]],
      ['Revision', [['Past papers', '#/papers'], ['Progress', '#/progress']]],
      ['Accounts', [['Welcome', '#/welcome'], ['Create account', '#/signup'], ['Log in', '#/login'], ['Verify code (6 digits)', '#/verify?for=signup'], ['Forgot password', '#/forgot'], ['New password', '#/reset-password'], ['Age check', '#/age'], ['Parent email (under 16)', '#/parent-email'], ['Waiting for approval', '#/parent-wait'], ['School code', '#/school-code']]],
      ['Parent\'s view', [['Approval email', '#/parent/approve-email'], ['Approval page', '#/parent/approve'], ['Payment email', '#/parent/pay-email'], ['Parent checkout', '#/parent/pay']]],
      ['Money', [['Pro page', '#/pro'], ['Checkout (18+)', '#/checkout'], ['Ask a parent to pay', '#/ask-parent'], ['Your plan', '#/plan'], ['Add school code', '#/plan-code'], ['School seat request', '#/school-request']]],
      ['Settings and help', [['Settings', '#/settings'], ['Delete account', '#/delete-account'], ['Legal', '#/legal'], ['Terms', '#/legal/terms'], ['Privacy', '#/legal/privacy'], ['Help', '#/help'], ['Feedback', '#/feedback'], ['Desktop notice', '#/desktop-notice']]]
    ];
    const v = {
      title: 'All screens', wide: true,
      html: head({ eyebrow: 'Prototype', title: 'All screens', sub: 'Every v1 screen, and switches to try different students. Everything here is mock data, saved only in this browser.' }) +
        '<section class="sec-block"><h2 class="t-eyebrow muted sec-title">Pretend to be</h2><div class="card switches">' +
          '<div class="setting"><span>Signed in</span>' + X.seg('auth', [['in', 'Yes'], ['out', 'No']], S.auth ? 'in' : 'out') + '</div>' +
          '<div class="setting"><span>Age group</span>' + X.seg('band', [['u16', 'Under 16'], ['16-17', '16-17'], ['18+', '18+']], S.band) + '</div>' +
          '<div class="setting"><span>Plan</span>' + X.seg('plan', [['free', 'Free'], ['pro', 'Pro'], ['school', 'School']], S.plan) + '</div>' +
          '<div class="setting"><span>Theme</span>' + X.seg('theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], S.theme) + '</div>' +
          btn('Reset everything', { variant: 'outline', id: 'reset', size: 'sm', icon: 'refresh' }) + '</div></section>' +
        '<div class="map-grid">' + G.map(([g, items]) => section(g, items.map(([t, h]) => row({ href: h, title: t, end: chevron })).join(''))).join('') + '</div>',
      mount(el) {
        X.bindSeg(el, 'auth', x => { S.auth = x === 'in'; X.save(); X.render(); });
        X.bindSeg(el, 'band', x => { S.band = x; if (x !== 'u16') S.approval = 'none'; X.save(); });
        X.bindSeg(el, 'plan', x => { S.plan = x; if (x === 'pro' && !S.renews) { const d = new Date(); d.setFullYear(d.getFullYear() + 1); S.renews = d.toISOString(); } if (x === 'school') S.school = 'Sample Community School'; X.save(); X.render(); });
        X.bindSeg(el, 'theme', x => { S.theme = x; X.save(); X.applyTheme(); });
        el.querySelector('#reset').addEventListener('click', () => { X.reset(); X.applyTheme(); X.toast('Prototype reset'); X.render(); });
      }
    };
    return S.auth ? v : Object.assign(v, { layout: 'solo', back: '#/welcome' });
  });
})();
