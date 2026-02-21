# Gossip — Expo Go app

A mobile app that shows **60-word gossip news**. Scroll up to see the next story. Each item has **like**, **dislike**, and **support** reactions.

## Run with Expo Go

1. Install dependencies (from this folder):
   ```bash
   cd gossip
   npm install
   ```

2. Start the dev server:
   ```bash
   npx expo start
   ```

3. Open the project in **Expo Go** on your phone:
   - Install **Expo Go** from the App Store (iOS) or Play Store (Android).
   - Scan the QR code shown in the terminal or browser.

## Features

- **60-word gossip news** — Each story is trimmed to about 60 words.
- **Scroll up for next** — Full-screen cards; swipe/scroll up to load the next news item.
- **Reactions** — Like 👍, Dislike 👎, and Support 💜 on every story. Tap again to remove your reaction.

## Project layout

- `App.js` — Main screen and vertical paged list.
- `components/GossipCard.js` — Single news card with title, body, and reaction buttons.
- `data/gossipNews.js` — Sample gossip items and `toSixtyWords()` helper.

To add more stories, edit the `GOSSIP_NEWS` array in `data/gossipNews.js`. Each item needs `id`, `title`, `body`, and `date`.
