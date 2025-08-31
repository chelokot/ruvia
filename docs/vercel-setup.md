Vercel + Preview per branch + OAuth design
==========================================

Overview
--------
- Frontend (Expo Web) deploys to Vercel with static export.
- Backend lives in `backend/` (git submodule) and deploys as a separate Vercel project.
- Preview deployments for every git branch with custom wildcard domains:
  - Front: `*.ruvia.art` → `branch-name.ruvia.art`
  - Back: `api-*.ruvia.art` → `api-branch-name.ruvia.art`
- Production domains:
  - Front: `ruvia.art`
  - Back: `api.ruvia.art`

Runtime API URL mapping
-----------------------
Front uses `src/lib/runtime.ts`:
- If host is `ruvia.art` → `https://api.ruvia.art`
- If host ends with `.ruvia.art` → `https://api-${host}` (e.g. `branch.ruvia.art` → `api-branch.ruvia.art`)
- Else → `process.env.EXPO_PUBLIC_API_BASE_URL`

This removes the need to inject per-deploy API URLs.

Google Sign-In (recommended)
----------------------------
- Keep OAuth on the backend only (Authorization Code flow). Google sees only backend callback URIs.
- Use fixed callbacks in Google Cloud Console:
  - Prod: `https://api.ruvia.art/auth/google/callback`
  - Staging: `https://api-staging.ruvia.art/auth/google/callback` (optional if you want a central staging auth)
- Any preview front (`*.ruvia.art`) initiates login against staging or its own preview backend. Prefer staging auth to avoid adding redirect URIs for every branch.
- Backend sets cookies/JWT with `SameSite=None; Secure; Domain=.ruvia.art` to cover previews.

Repository structure
--------------------
- Frontend at repo root (this project)
- Backend as git submodule in `backend/`

Add backend submodule
---------------------
Run in repo root:

```
git submodule add <YOUR_BACKEND_GIT_URL> backend
git submodule update --init --recursive
```

Vercel projects (Connected Projects)
------------------------------------
Create two Vercel projects pointing to the same repo:

1) Frontend project
- Root Directory: repo root
- Build Command: `npm run build:web`
- Output Directory: `.expo/web-build`
- Framework preset: None (static)
- Environment Variables:
  - Production:
    - `EXPO_PUBLIC_API_BASE_URL=https://api.ruvia.art`
  - Preview:
    - `EXPO_PUBLIC_API_BASE_URL=https://api-staging.ruvia.art` (or leave empty when using preview backends)
- Domains:
  - Production: `ruvia.art`
  - Preview: `*.ruvia.art` (Wildcard)

2) Backend project
- Root Directory: `backend/`
- Runtime: Node/Serverless (depends on backend)
- Environment Variables: your backend secrets
- Domains:
  - Production: `api.ruvia.art`
  - Preview: `api-*.ruvia.art` (Wildcard)
- If you prefer one staging backend instead of preview-per-branch for auth, also add: `api-staging.ruvia.art`

DNS setup
---------
Create CNAME records to Vercel (in your DNS provider):
- `ruvia.art` → Vercel
- `*.ruvia.art` → Vercel
- `api.ruvia.art` → Vercel
- `api-*.ruvia.art` → Vercel
- (optional) `api-staging.ruvia.art` → Vercel

Google Cloud Console
--------------------
1) Create OAuth 2.0 Client ID (Web application)
2) Authorized redirect URIs:
   - `https://api.ruvia.art/auth/google/callback`
   - `https://api-staging.ruvia.art/auth/google/callback` (optional)
3) Authorized JavaScript origins are not required if OAuth is only on backend.

Frontend build
--------------
- `vercel.json` is configured with:
  - `buildCommand: npm run build:web`
  - `outputDirectory: .expo/web-build`

Local development
-----------------
- Front web: `npm run web`
- Set `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000` (or your local backend) in `.env`

Notes
-----
- If you insist on per-branch backend + per-branch OAuth callbacks in Google, you must automate Google API updates; Google does not support wildcard redirect URIs. The recommended approach above avoids this limitation.

