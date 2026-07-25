# PetLog — Client

React + TypeScript SPA for PetLog. Talks to the Express API in `../server` over REST; never touches MongoDB, Firebase Admin, or the Anthropic key directly.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite, Node 24+, native TS |
| Routing | react-router-dom v7 |
| HTTP | axios (single instance in `src/api/client.ts`) |
| Auth | Firebase client SDK (email/password + Google) |
| Styling | Plain CSS custom properties — Material 3 tokens ported from the design bundle, no component library |

## Folder structure

```
src/
├── api/          # one file per resource; every function returns typed data, not the axios response
├── components/   # shared UI: Icon, BottomNav, ProtectedRoute, Toast
├── config/       # firebase.ts
├── context/      # AuthContext
├── pages/        # one file per route
├── styles/       # tokens.css (M3 color roles), fonts.css, global.css (component classes)
├── types/        # interfaces mirroring server Mongoose models
└── utils/        # petMeta.ts (species/date helpers), useToast.ts
```

## Conventions

- Local imports always use the `.ts`/`.tsx` extension (matches the server's Node 24 native-TS convention, and `verbatimModuleSyntax` requires it here too).
- API wrapper functions in `src/api/*` unwrap the `{ success, data }` envelope — pages never see the envelope, only the payload.
- `api/client.ts`'s request interceptor attaches the Firebase ID token to every request. Don't add `Authorization` headers manually anywhere else.
- No CSS-in-JS, no MUI. Reusable look (`.card`, `.pill`, `.btn`, `.field`, `.avatar`, etc.) lives in `styles/global.css`; page-specific one-off layout uses inline `style`.
- Design tokens are M3 color **roles** (`--md-sys-color-*`) plus friendly aliases (`--brand`, `--surface-card`, `--text-muted`, …) — use the aliases in page code, reach for the raw `--md-sys-color-*` names only for states the aliases don't cover.
- `App.tsx` is the only place routes are declared. Protected routes wrap in `<ProtectedRoute>`; `/login` and `/share/:token` are the only public ones.

## Known gaps vs. the original Tech Design doc

- No `CareTemplate` collection on the backend. The onboarding care-plan step (`src/pages/Onboarding.tsx`) hardcodes the 5 template items client-side and creates `Reminder` documents directly — revisit if the backend ever grows real `CareTemplate` data.
- Weight isn't a `Pet` field on the backend — the onboarding weight input creates an initial `HealthRecord` of type `weight` instead.

## Environment Variables

```env
# .env (never commit)
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Get these from Firebase Console → Project Settings → General → Your apps → SDK setup and configuration. Enable Email/Password and Google under Authentication → Sign-in method — the client code calls both.
