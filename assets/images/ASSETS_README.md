# App icon & splash assets (Expo + EAS Build)

Place your design exports here. Paths are referenced from `app.json`.

## Required files

| File | Size (px) | Format | Notes |
|------|-----------|--------|--------|
| **icon.png** | **1024 × 1024** | PNG | App icon. Square, no transparency (iOS). No rounded corners—OS applies mask. |
| **splash-icon.png** | **1024 × 1024** | PNG | Splash logo. Transparent OK. Centered on `#1a1a2e` background; Expo scales to fit. |

## Android adaptive icon (optional)

- **Foreground:** Same as `icon.png` (1024×1024). Keep important content in the center **~85%** (432×432 px in the middle) so it isn’t clipped on round/rounded-square devices.
- **Background:** Solid color is set in `app.json` (`android.adaptiveIcon.backgroundColor`). No extra file unless you want a custom background image.

## Summary for designer

- **One 1024×1024 PNG** for the logo/icon (used for both app icon and splash).
- **App icon:** No transparency for iOS; square; no rounded corners in the file.
- **Splash:** Same asset is centered on dark background; transparent or solid is fine.

After adding `icon.png` and `splash-icon.png`, run a new EAS build to see them in the app.
