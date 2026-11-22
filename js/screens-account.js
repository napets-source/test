/* ==========================================================================
   Account screens: Welcome, Sign up, Log in, Verify (6-digit code), Forgot and
   Reset password, Age check, Parent approval, School code, and the parent's view.
   Emails are mocked; the real build sends them through Resend.
   ========================================================================== */
(function () {
  'use strict';
  const X = window.EX, { S, flow, esc, icon, btn, field, route, go } = X;
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const solo = (o) => Object.assign({ layout: 'solo' }, o);
  const brandHead = (title, sub) => '<header class="solo-head">' + X.logoMark(48) + '<h1 class="t-h1">' + esc(title) + '</h1>' + (sub ? '<p class="muted">' + sub + '</p>' : '') + '</header>';
  const googleBtn = (label) => btn(label, { variant: 'outline', block: true, icon: 'google', id: 'google' });
  const divider = '<div class="or"><span>or</span></div>';

  /* ---------- 6-digit code input ----------
     One box per digit. Typing moves on, Backspace moves back, arrow keys move,
     and pasting a code (or the phone's one-time-code autofill) fills every box. */
  function codeInput() {
    return '<div class="code" role="group" aria-label="6-digit code">' +
      [0, 1, 2, 3, 4, 5].map(i => (i === 3 ? '<span class="code-dash" aria-hidden="true"></span>' : '') +
        '<input class="code-box" inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Digit ' + (i + 1) + '"' + (i === 0 ? ' autocomplete="one-time-code" autofocus' : ' autocomplete="off"') + '>').join('') + '</div>';
  }
  function bindCode(el, onComplete) {
    const boxes = [...el.querySelectorAll('.code-box')];
    const value = () => boxes.map(b => b.value).join('');
    const fill = (digits, from) => {
      digits.split('').forEach((d, k) => { if (boxes[from + k]) boxes[from + k].value = d; });
      const nextEmpty = boxes.findIndex(b => !b.value);
      (boxes[nextEmpty < 0 ? 5 : nextEmpty]).focus();
      check();
    };
    const check = () => { boxes.forEach(b => b.classList.toggle('is-filled', !!b.value)); if (value().length === 6) onComplete(value()); };
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => {
        const d = b.value.replace(/\D/g, '');
        if (d.length > 1) { b.value = ''; fill(d.slice(0, 6 - i), i); return; } // autofill can put the whole code in one box
        b.value = d;
        if (d && boxes[i + 1]) boxes[i + 1].focus();
        check();
      });
      b.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !b.value && boxes[i - 1]) { boxes[i - 1].value = ''; boxes[i - 1].focus(); check(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' && boxes[i - 1]) { boxes[i - 1].focus(); e.preventDefault(); }
        if (e.key === 'ArrowRight' && boxes[i + 1]) { boxes[i + 1].focus(); e.preventDefault(); }
      });
      b.addEventListener('focus', () => b.select());
      b.addEventListener('paste', e => {
        const d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        if (!d) return;
        e.preventDefault(); fill(d, d.length === 6 ? 0 : i);
      });
    });
    return { clear() { boxes.forEach(b => { b.value = ''; b.classList.remove('is-filled'); }); boxes[0].focus(); }, setError(on) { el.querySelector('.code').classList.toggle('is-error', on); } };
  }

  /* ---------- Welcome ---------- */
  route('welcome', () => solo({
    title: 'Welcome',
    html: '<div class="welcome">' + X.logoMark(72) + '<h1 class="t-display">Study smarter for the Junior Cycle</h1>' +
      '<p class="muted">Flashcards, quizzes, revision notes and past papers for Maths, English and Irish. No ads, ever.</p></div>' +
      '<div class="list">' + btn('Create an account', { href: '#/signup', block: true }) + btn('Log in', { variant: 'secondary', href: '#/login', block: true }) +
      btn('I have a school code', { variant: 'ghost', href: '#/school-code', block: true, icon: 'school' }) + '</div>' +
      '<p class="t-small muted center">By continuing you agree to the <a href="#/legal/terms">Terms</a> and <a href="#/legal/privacy">Privacy Policy</a>.</p>'
  }));

  /* ---------- Sign up ---------- */
  route('signup', () => solo({
    title: 'Create an account', back: '#/welcome',
    html: brandHead('Create your account') + googleBtn('Continue with Google') + divider +
      '<form class="form" id="f" novalidate>' + field({ id: 'name', label: 'Your name', value: '', placeholder: 'John Doe', attrs: ' autocomplete="name"' }) +
      field({ id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', attrs: ' autocomplete="email"' }) +
      field({ id: 'pw', label: 'Password', type: 'password', help: 'At least 8 characters', attrs: ' autocomplete="new-password"' }) +
      btn('Continue', { block: true, attrs: ' type="submit"' }) + '</form>' +
      '<p class="t-small muted center">Already have an account? <a href="#/login">Log in</a></p>',
    mount(el) {
      el.querySelector('#google').addEventListener('click', () => { flow.signup = { name: 'John Doe', email: 'john.doe@gmail.com' }; go('#/age'); });
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault();
        const n = el.querySelector('#name'), m = el.querySelector('#email'), p = el.querySelector('#pw');
        X.fieldError(n, n.value.trim() ? '' : 'Enter your name');
        X.fieldError(m, emailOk(m.value) ? '' : 'Enter a valid email address');
        X.fieldError(p, p.value.length >= 8 ? '' : 'Use at least 8 characters');
        if (!n.value.trim() || !emailOk(m.value) || p.value.length < 8) return;
        flow.signup = { name: n.value.trim(), email: m.value.trim() };
        go('#/verify?for=signup');
      });
    }
  }));

  /* ---------- Log in ---------- */
  route('login', () => solo({
    title: 'Log in', back: '#/welcome',
    html: brandHead('Welcome back') + googleBtn('Log in with Google') + divider +
      '<form class="form" id="f" novalidate>' + field({ id: 'email', label: 'Email', type: 'email', value: S.user.email, attrs: ' autocomplete="email"' }) +
      field({ id: 'pw', label: 'Password', type: 'password', attrs: ' autocomplete="current-password"' }) +
      '<a class="t-small link-right" href="#/forgot">Forgot password?</a>' +
      btn('Log in', { block: true, attrs: ' type="submit"' }) + '</form>' +
      X.protoNote('Any email and password work in the prototype.') +
      '<p class="t-small muted center">New here? <a href="#/signup">Create an account</a></p>',
    mount(el) {
      const ok = () => { S.auth = true; X.save(); go('#/home'); };
      el.querySelector('#google').addEventListener('click', ok);
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault();
        const m = el.querySelector('#email'), p = el.querySelector('#pw');
        X.fieldError(m, emailOk(m.value) ? '' : 'Enter a valid email address');
        X.fieldError(p, p.value ? '' : 'Enter your password');
        if (emailOk(m.value) && p.value) ok();
      });
    }
  }));

  /* ---------- Verify: 6-digit code (sign up, password reset, email change) ---------- */
  route('verify', (p, q) => {
    const why = q.get('for') || 'signup';
    const email = why === 'reset' ? (flow.reset || S.user.email) : why === 'email' ? (flow.newEmail || S.user.email) : ((flow.signup || {}).email || 'you@example.com');
    const back = why === 'reset' ? '#/forgot' : why === 'email' ? '#/settings' : '#/signup';
    return solo({
      title: 'Check your email', back,
      html: brandHead('Check your email', 'We sent a 6-digit code to <b>' + esc(email) + '</b>. It expires in 10 minutes.') +
        codeInput() + '<p class="help err" id="err" hidden></p>' +
        '<div class="list">' + btn('Verify', { id: 'go', block: true, attrs: ' disabled' }) +
        btn('Resend code', { variant: 'ghost', id: 'resend', block: true, icon: 'refresh' }) + '</div>' +
        X.protoNote('Any 6 digits work. Try <b>000000</b> to see the wrong-code state, or copy <b>482913</b> and paste it.'),
      mount(el) {
        const err = el.querySelector('#err'), goBtn = el.querySelector('#go');
        let code = '';
        const c = bindCode(el, v => { code = v; goBtn.disabled = false; submit(); });
        el.querySelectorAll('.code-box').forEach(b => b.addEventListener('input', () => { if (b.value === '') { goBtn.disabled = true; } err.hidden = true; c.setError(false); }));
        function submit() {
          if (code === '000000') { c.setError(true); err.hidden = false; err.innerHTML = icon('info', 's16') + 'That code is not right. Check the email and try again.'; return; }
          if (why === 'signup') go('#/age');
          else if (why === 'reset') go('#/reset-password');
          else { S.user.email = flow.newEmail; X.save(); X.toast('Email updated'); go('#/settings'); }
        }
        goBtn.addEventListener('click', submit);
        // Resend with a short cooldown, so the button can't be spammed (rate limits are a v1 safeguard).
        const rs = el.querySelector('#resend');
        rs.addEventListener('click', () => {
          X.toast('New code sent'); c.clear(); goBtn.disabled = true;
          let n = 30; rs.disabled = true; const label = rs.querySelector('span');
          const t = setInterval(() => { label.textContent = 'Resend in ' + n-- + 's'; if (n < 0) { clearInterval(t); rs.disabled = false; label.textContent = 'Resend code'; } }, 1000);
        });
      }
    });
  });

  /* ---------- Forgot and reset password ---------- */
  route('forgot', () => solo({
    title: 'Reset password', back: '#/login',
    html: brandHead('Reset your password', 'Enter your email and we will send you a 6-digit code.') +
      '<form class="form" id="f" novalidate>' + field({ id: 'email', label: 'Email', type: 'email', value: S.user.email }) + btn('Send code', { block: true, attrs: ' type="submit"' }) + '</form>',
    mount(el) {
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault(); const m = el.querySelector('#email');
        X.fieldError(m, emailOk(m.value) ? '' : 'Enter a valid email address');
        if (emailOk(m.value)) { flow.reset = m.value.trim(); go('#/verify?for=reset'); }
      });
    }
  }));
  route('reset-password', () => solo({
    title: 'New password', back: '#/login',
    html: brandHead('Choose a new password') + '<form class="form" id="f" novalidate>' +
      field({ id: 'pw', label: 'New password', type: 'password', help: 'At least 8 characters', attrs: ' autocomplete="new-password"' }) +
      field({ id: 'pw2', label: 'Type it again', type: 'password', attrs: ' autocomplete="new-password"' }) + btn('Save password', { block: true, attrs: ' type="submit"' }) + '</form>',
    mount(el) {
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault(); const a = el.querySelector('#pw'), b = el.querySelector('#pw2');
        X.fieldError(a, a.value.length >= 8 ? '' : 'Use at least 8 characters');
        X.fieldError(b, a.value === b.value ? '' : 'The passwords do not match');
        if (a.value.length >= 8 && a.value === b.value) { X.toast('Password changed. Log in again.'); go('#/login'); }
      });
    }
  }));

  /* ---------- Age check (date of birth used once, never stored) ---------- */
  route('age', () => solo({
    title: 'Your age', back: flow.school ? '#/school-code' : '#/signup',
    html: brandHead('When were you born?', 'We use this once to check which rules apply to you. We only keep your age group, never your date of birth.') +
      '<form class="form" id="f" novalidate><div class="dob">' +
      field({ id: 'd', label: 'Day', attrs: ' inputmode="numeric" maxlength="2" placeholder="DD"' }) +
      field({ id: 'm', label: 'Month', attrs: ' inputmode="numeric" maxlength="2" placeholder="MM"' }) +
      field({ id: 'y', label: 'Year', attrs: ' inputmode="numeric" maxlength="4" placeholder="YYYY"' }) + '</div>' +
      '<p class="help err" id="err" hidden></p>' + btn('Continue', { block: true, attrs: ' type="submit"' }) + '</form>' +
      X.protoNote('Try 2012 (under 16, parent approval), 2009 (16 to 17) or 2000 (18+).'),
    mount(el) {
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault();
        const d = +el.querySelector('#d').value, m = +el.querySelector('#m').value || 1, y = +el.querySelector('#y').value;
        const err = el.querySelector('#err');
        const dob = new Date(y, m - 1, d || 1);
        if (!y || y < 1900 || dob > new Date() || m > 12 || d > 31) { err.hidden = false; err.innerHTML = icon('info', 's16') + 'Enter a real date of birth'; return; }
        const now = new Date(); let age = now.getFullYear() - y; if (now < new Date(now.getFullYear(), m - 1, d || 1)) age--;
        if (age < 12) { err.hidden = false; err.innerHTML = icon('info', 's16') + 'Examinise is for secondary school students (12 and up).'; return; }
        // Only the age band is kept. The date itself is thrown away here.
        const band = age < 16 ? 'u16' : age < 18 ? '16-17' : '18+';
        const f = flow.signup || {};
        Object.assign(S, { auth: true, band, user: { name: f.name || S.user.name, email: f.email || S.user.email }, approval: 'none', plan: flow.school ? 'school' : 'free', school: flow.school || null });
        if (band === 'u16' && !flow.school) { S.approval = 'pending'; X.save(); go('#/parent-email'); return; }
        X.save(); X.toast('Welcome to Examinise'); go('#/home');
      });
    }
  }));
  // Age gate tip: the "12 and up" minimum is an assumption from the docs' audience (about 12 to 18). Flag in summary.

  /* ---------- Parent approval (under 16) ---------- */
  route('parent-email', () => solo({
    title: 'Parent or guardian',
    html: brandHead('Ask a parent or guardian', 'Because you are under 16, a parent or guardian needs to say yes before you can start. We will email them a link.') +
      '<form class="form" id="f" novalidate>' + field({ id: 'pe', label: 'Their email', type: 'email', value: S.parentEmail, placeholder: 'parent@example.com' }) +
      btn('Send the email', { block: true, attrs: ' type="submit"' }) + '</form>' +
      X.note('They do not need an account. The email says exactly what they are approving and what data we keep.'),
    mount(el) {
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault(); const m = el.querySelector('#pe');
        X.fieldError(m, emailOk(m.value) ? '' : 'Enter a valid email address');
        if (!emailOk(m.value)) return;
        if (m.value.trim().toLowerCase() === S.user.email.toLowerCase()) { X.fieldError(m, 'This has to be a different email from yours'); return; }
        S.parentEmail = m.value.trim(); S.approval = 'pending'; S.approvalSent = Date.now(); X.save(); go('#/parent-wait');
      });
    }
  }));
  route('parent-wait', () => {
    if (S.approval !== 'pending') return { redirect: '#/home' };
    const exp = new Date((S.approvalSent || Date.now()) + 7 * 864e5);
    return solo({
      title: 'Waiting for approval',
      html: brandHead('Waiting for approval', 'We emailed <b>' + esc(S.parentEmail || 'your parent') + '</b>. Your account opens as soon as they approve it.') +
        '<div class="card status-card">' + icon('clock') + '<div><b>Link valid until ' + X.fmtDate(exp) + '</b><p class="t-small muted">After 7 days you can send a new one.</p></div></div>' +
        '<div class="list">' + btn('Resend the email', { variant: 'secondary', id: 'resend', block: true, icon: 'refresh' }) +
        btn('Use a different email', { variant: 'ghost', href: '#/parent-email', block: true }) +
        btn('Log out', { variant: 'ghost', id: 'out', block: true, icon: 'logout' }) + '</div>' +
        X.protoNote('<a href="#/parent/approve-email">Open the parent\'s email</a> to see what they get.'),
      mount(el) {
        el.querySelector('#resend').addEventListener('click', () => { S.approvalSent = Date.now(); X.save(); X.toast('Email sent again'); });
        el.querySelector('#out').addEventListener('click', () => { S.auth = false; X.save(); go('#/welcome'); });
      }
    });
  });

  /* ---------- School code ---------- */
  route('school-code', () => solo({
    title: 'School code', back: '#/welcome',
    html: brandHead('Join with a school code', 'Your school gives you this code. It gives you Pro for as long as your school has seats.') +
      '<form class="form" id="f" novalidate>' + field({ id: 'sc', label: 'School code', placeholder: 'SCHOOL20', attrs: ' autocapitalize="characters" autocomplete="off" spellcheck="false" autofocus' }) +
      btn('Continue', { block: true, attrs: ' type="submit"' }) + '</form>' +
      X.protoNote('Use <b>SCHOOL20</b>. Code format is still open (for example RKBRK-012345); codes are set up by hand for v1.'),
    mount(el) {
      const inp = el.querySelector('#sc');
      inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase(); });
      el.querySelector('#f').addEventListener('submit', e => {
        e.preventDefault();
        if (inp.value.trim() !== 'SCHOOL20') { X.fieldError(inp, 'That code is not valid, or the school has no seats left.'); return; }
        flow.school = 'Sample Community School'; go('#/signup-school');
      });
    }
  }));
  // After a valid code: create the account (same form), then the age check. Under 16: the school consents.
  route('signup-school', () => {
    const v = X.ROUTES.signup();
    v.back = '#/school-code';
    v.html = '<div class="card status-card">' + icon('school') + '<div><b>' + esc(flow.school || 'Your school') + '</b><p class="t-small muted">Code accepted. Your school covers Pro.</p></div></div>' + v.html;
    return v;
  });

  /* ---------- Parent's view (prototype only): approval email and page ---------- */
  const mail = (subject, body) => '<article class="card mail"><div class="mail-head"><span class="avatar">' + X.logoMark(40) + '</span><div><b>Examinise</b><p class="t-small muted">To: ' + esc(S.parentEmail || 'parent@example.com') + '</p></div></div>' +
    '<h1 class="t-h2">' + esc(subject) + '</h1>' + body + '</article>';
  route('parent', (p) => {
    const which = p[0];
    if (which === 'approve-email') return {
      layout: 'parent', title: 'Email', back: '#/parent-wait',
      html: mail(S.user.name + ' wants to use Examinise',
        '<p>' + esc(S.user.name) + ' signed up to Examinise, a study app for Junior Cycle Maths, English and Irish. Because they are under 16, we need your permission first.</p>' +
        '<p><b>What we keep:</b> their name, email, age group (not their date of birth) and study progress. We never show ads and never sell or share data.</p>' +
        btn('Review and approve', { href: '#/parent/approve', block: true }) + '<p class="t-small muted">This link works for 7 days. If you did not expect this email, you can ignore it.</p>')
    };
    if (which === 'approve') return {
      layout: 'parent', title: 'Approve', back: '#/parent/approve-email',
      html: '<header class="solo-head">' + X.logoMark(48) + '<h1 class="t-h1">Approve ' + esc(X.firstName()) + '\'s account</h1><p class="muted">You do not need an account to do this.</p></header>' +
        '<div class="card prose"><h2 class="t-h3">What you are agreeing to</h2><p>' + esc(S.user.name) + ' can use Examinise on the Free plan. You can ask us to delete the account at any time.</p>' +
        '<h2 class="t-h3">What we store</h2><p>Name, email, age group, study progress and a record of this approval (who approved and when).</p></div>' +
        '<label class="tick"><input type="checkbox" id="ok"><span class="box"><svg viewBox="0 0 24 24"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span>I am ' + esc(X.firstName()) + '\'s parent or guardian</span></label>' +
        '<div class="list">' + btn('Approve', { id: 'yes', block: true, attrs: ' disabled' }) + btn('Do not approve', { variant: 'ghost', id: 'no', block: true }) + '</div>',
      mount(el) {
        const ok = el.querySelector('#ok'), yes = el.querySelector('#yes');
        ok.addEventListener('change', () => { yes.disabled = !ok.checked; });
        yes.addEventListener('click', () => { S.approval = 'approved'; S.approvalRecord = { by: S.parentEmail, at: Date.now() }; X.save(); go('#/parent/approved'); });
        el.querySelector('#no').addEventListener('click', () => go('#/parent/declined'));
      }
    };
    if (which === 'approved' || which === 'declined') return {
      layout: 'parent', title: 'Done',
      html: '<header class="solo-head">' + X.logoMark(48) + '<h1 class="t-h1">' + (which === 'approved' ? 'Thank you, it\'s approved' : 'Not approved') + '</h1><p class="muted">' +
        (which === 'approved' ? esc(X.firstName()) + ' can start studying now. You can close this page.' : 'The account stays locked and will be deleted after 7 days.') + '</p></header>' +
        btn('Prototype: back to the student\'s app', { variant: 'secondary', href: '#/home', block: true })
    };
    if (which === 'pay-email') {
      const r = S.payRequest || { cycle: 'yearly' };
      return {
        layout: 'parent', title: 'Email', back: '#/ask-parent',
        html: mail(S.user.name + ' asked you for Examinise Pro',
          '<p>' + esc(S.user.name) + ' would like Examinise Pro. It opens every chapter in Maths, English and Irish.</p>' +
          '<p><b>' + (r.cycle === 'monthly' ? '€4.99 a month' : '€39.99 a year') + '</b>. You can cancel at any time from the link in every receipt.</p>' +
          btn('Pay with Stripe', { href: '#/parent/pay', block: true }) + '<p class="t-small muted">No ads, and we never sell or share data. If you did not expect this email, you can ignore it.</p>')
      };
    }
    if (which === 'pay') return X.ROUTES.checkout(['parent']);
    return { redirect: '#/map' };
  });
})();
