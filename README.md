# Examinise v1 front-end prototype

Every v1 screen, clickable, with mock data. Front end only: no backend, no real email or payments. The screen plan is in `V1-SCREENS.md`.

## Run it

Start the `current` preview in Claude Code, or:

```powershell
python -m http.server 5180 --directory examinise-current
```

Then open http://localhost:5180. Open **All screens (prototype)** from the profile menu (bottom of the sidebar), or go to `#/map`. From there you can jump to any screen and switch who you are pretending to be: signed in or not, age group, plan and theme.

## Files

```
index.html               Loads everything below, in order
css/tokens.css           Copy of design-system/examinise-tokens.css (font path changed to ../fonts)
css/components.css       Copy of design-system/components.css (playground-only styles removed)
css/app.css              Shell (sidebar behind the rounded panel) and the screen pieces
fonts/                   Geist (variable) and Geist Serif only
js/brand.js              Logo paths from the brand assets
js/icons.js              PLACEHOLDER icons, hand-drawn. Swap the paths here; names stay the same
js/data.js               Dummy content: 3 subjects x 3 chapters x 3 topics
js/core.js               State (saved in this browser), small components (btn, row, field...), route list
js/screens-study.js      Home, Subjects, Subject, Topic, Flashcards, Quiz, Notes, Search, Past papers, Progress
js/screens-account.js    Welcome, Sign up, Log in, 6-digit code, Password reset, Age check, Parent approval, School code
js/screens-more.js       Pro, Checkout, Ask a parent, Plan, Settings, Delete account, Legal, Help, Feedback, screen map
js/app.js                Sidebar, top bar and the router (#/home, #/topic/maths-0-0, ...)
```

## Test values

- 6-digit code: any 6 digits work, `000000` shows the wrong-code state. Pasting a code fills all six boxes.
- Age check: 2012 (under 16), 2009 (16-17), 2000 (18+).
- School code: `SCHOOL20`.
