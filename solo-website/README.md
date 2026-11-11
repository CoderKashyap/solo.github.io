# SOLO Network — Website

Static, dependency-free website (HTML + CSS + vanilla JS).

## Pages
| File | Page |
|---|---|
| `index.html` | Home |
| `learners.html` | Learners & Job Seekers |
| `institutions.html` | Educational Institutions |
| `employers.html` | Employers |
| `government.html` | Government & public agencies |

## Structure
```
assets/
  css/styles.css   – design tokens, components, animations, responsive rules
  js/main.js       – interactions (see below)
  img/solo-logo.png
```

## Run locally
Open `index.html` in a browser, or serve the folder:
```
npx serve .        # or: python3 -m http.server
```
Deploy by uploading the folder as-is to any static host (Netlify, Vercel, S3, cPanel, GitHub Pages).

## Typography
- Headings: **Bricolage Grotesque** (Google Fonts, variable)
- Body: **Plus Jakarta Sans** (Google Fonts)

## Brand colours (CSS variables in `:root`)
Navy `#0B1035` · Orange `#FF5A1F` · Amber `#FFB020` · Blue `#2F6BFF` · Violet `#6C3BEB`

## Interactions (`main.js`)
- Scroll reveal with staggered children (`data-reveal`, `data-stagger`)
- Product windows tilt up on entry and follow the mouse (`data-tilt`)
- Animated meters, readiness ring, bar charts, line charts, count-up numbers (`data-count`)
- Rotating headline word with smooth width animation
- Accessible tabs (arrow keys, Home/End)
- Seamless marquees (content is cloned automatically)
- Sticky header that condenses on scroll, reading-progress bar, back-to-top button
- Mobile menu (Esc to close), page-to-page fade transitions
- Contact form opens the visitor's email app pre-filled to hello@thesolo.network
- All motion is disabled for visitors with "reduce motion" turned on

## To finish before launch
- Replace `assets/img/solo-logo.png` with the official SVG/high-res logo (current one was cut from a slide).
- Government page hero: replace the two `[#]` placeholders with real learner/credential counts.
- Dashboard figures in product mock-ups are illustrative and labelled "Sample".
- Connect the contact form to your CRM/form service if you prefer it over email.
