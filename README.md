# Tutor app

Two-portal app for home tutors: tutors manage schedule, attendance, and
homework; parents view their children's classes and get notified on
absences.

## What's scaffolded here

- `app/` — Expo Router screens (file-based routing)
  - `auth/login.js` — sign in
  - `index.js` — routes to tutor or parent portal based on role after login
  - `tutor/schedule.js`, `tutor/attendance.js` — tutor portal
  - `parent/schedule.js` — parent portal with child switcher
- `lib/supabase.js` — Supabase client
- `supabase/schema.sql` — full database schema with row-level security,
  so each tutor only ever sees their own students, and each parent only
  ever sees their own children

## Still to build (not in this scaffold yet)

- `tutor/homework.js` — post homework screen (wireframed, not coded)
- `tutor/adhoc.js` — post ad-hoc class screen
- `tutor/attendance-history.js` — monthly calendar + pattern detection
- `parent/homework.js`, `parent/attendance-history.js`, `parent/messages.js`
- Wiring the tutor attendance screen to actually call the included
  `supabase/functions/notify-absence` edge function after saving
  absences (the function itself is written, just not yet called)
- Sign-up flow (this scaffold assumes accounts are created manually in
  Supabase for now — add self-serve signup later if needed)

## Setup on your laptop

1. Install Node.js (LTS) if you don't have it: https://nodejs.org
2. `npm install`
3. Create a free project at https://supabase.com
4. In the Supabase SQL editor, paste and run `supabase/schema.sql`
5. Copy `.env.example` to `.env` and fill in your Supabase URL and anon
   key (Project settings > API in Supabase)
6. `npx expo start` — scan the QR code with the Expo Go app on your
   iPad or iPhone to test live

## Publishing to the App Store (no Mac needed)

1. `npm install -g eas-cli`
2. `eas login`
3. `eas build --platform ios` — builds the iOS binary on Expo's cloud
   Mac servers
4. `eas submit --platform ios` — submits to App Store Connect
   (requires an Apple Developer account, $99/year)
