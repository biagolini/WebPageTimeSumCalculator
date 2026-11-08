---
inclusion: always
name: web-conventions
description: Conventions for Time Sum Calculator, a vanilla HTML/CSS/JS static site on GitHub Pages
---

# Web Conventions

Time Sum Calculator is a static web app built with plain HTML, CSS, and JavaScript (vanilla, no framework, no build step, no backend). It is a running-partials calculator: the user logs runs (distance plus time) and strength or other activities (time plus a free text label), sees cumulative time and average pace, and copies a formatted summary. Keep it this way unless explicitly asked to change the stack.

## Structure

Three files do all the work, and they stay that way:

- `index.html`: markup only. Elements the script needs are referenced by `id` or by `class`. Do not inline styles or scripts.
- `style.css`: all styling. No CSS framework (no Tailwind, no Bootstrap).
- `script.js`: all behavior. No bundler, no npm dependencies, no ES module imports; the file is loaded directly with a plain `<script src="script.js">`.

## JavaScript

- Vanilla ES6+ in the browser. Do not introduce frameworks, libraries, or a build pipeline. If a feature seems to need one, raise it first instead of adding it.
- Keep DOM access through `document.getElementById` / `querySelector` as the existing code does. When adding an element the script talks to, give it a stable `id` (wire-up) or a `data-*` attribute (per-field reads, as with `data-field` and `data-type`).
- Persisted state lives in `localStorage` under the `entries` key as a JSON array; each item carries a `type` (`run` or `activity`). Preserve that shape when changing persistence so older saved data still loads.
- Match the current style: two-space indentation, single quotes, small focused functions, a short comment above any function whose intent is not obvious from its name.

## HTML and CSS

- Semantic HTML and mobile-first layout; the app targets phones, and the existing media query at `max-width: 480px` is the small-screen baseline.
- Reuse the existing design language rather than inventing new values: the purple gradient and `#667eea` accent for runs, the green accent for activities, card radius and shadow, the `.btn` shapes. Follow the patterns already in `style.css` instead of hardcoding new one-off colors when an established one fits.

## No emojis or pictographs as icons

Never use emojis or Unicode pictographs (for example 🏃 ⏱ ✓ ✕ ★ 🗑) as interface icons. They render inconsistently across systems and look unprofessional. If a real icon is ever needed, use an inline outline SVG. Plain typographic glyphs that are text, not icons, are fine and already in use: the `×` on the delete button, the `+` on the add buttons, the middle dot, en/em dash, and ellipsis.

## Verifying a change

There is no test runner. After editing, at minimum:

- Run `node --check script.js` to catch syntax errors.
- Open `index.html` in a browser and exercise the change (add a run, add an activity, delete, reload to confirm `localStorage` restore, and copy the summary).

For logic that can be isolated from the DOM (time and summary formatting), a small throwaway Node script asserting expected strings is a fast way to confirm correctness before the manual check.
