# Maple Farm Tracker

A free, shareable, mobile-friendly MapleStory farming calculator. No login, backend, or installation required.

## Features
- 30-minute timer with start, pause, resume, reset, and actual elapsed-time tracking
- Starting and ending levels, EXP percentages, raw EXP, and mesos
- EXP/hour for sessions without a level-up when raw EXP or EXP required to level is supplied
- Cash mesos/hour, drop values, and total estimated value/hour
- Drop names, quantities, and manually entered market prices
- Links to mesos.watch and cozy.markets
- Browser-local session history and CSV export

## Deploy to Vercel
1. Import this GitHub repository at https://vercel.com/new
2. Select **Other** as the framework preset (plain HTML/CSS/JavaScript).
3. Leave build command blank and output directory as the repository root.
4. Deploy.

This is a static site: `index.html` is the entire app. You can also deploy with GitHub Pages.

## Limitations
- Prices are **not fetched automatically** from market sites. Enter estimated item values manually.
- EXP/hour across level-ups is intentionally unavailable until a verified server-specific EXP table is added.
- EXP percentages by themselves do not determine raw EXP gained.
- Sessions are stored only in the browser's localStorage, not synced across devices.
- Do not add the value of drops already sold and reflected in your ending meso balance a second time.

## Privacy
All tracking data stays on the user's device. No login, analytics, or database.
