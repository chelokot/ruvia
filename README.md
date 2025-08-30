Ruvia — AI Profile Pictures (React Native + Expo)

Getting started
- Prereqs: Node 18+, npm or pnpm, Expo CLI (optional)
- Install deps: `npm install`
- Set env vars in a `.env` (or via your shell):
  - EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, EXPO_PUBLIC_FIREBASE_APP_ID
  - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
  - EXPO_PUBLIC_API_BASE_URL (backend base URL)
- Run web: `npm run web`
- Run Android: `npm run android`

Notes
- Google Sign-In works on web via Firebase popup; on native it uses Expo AuthSession to obtain an ID token.
- Backend endpoints are implemented but not tested: `/generate` and `/purchase`.
- Assets are placeholders; swap in real images under `assets/` later.
- App is dark-themed with cyan primary (#00e5ff) for accessibility/contrast.

Testing
- `npm test` runs jest tests (example provided for ToggleSelector).

