# Friendzo Frontend

Friendzo Frontend is the Next.js client for the Friendzo social platform. It handles the public site, authenticated social experience, admin dashboards, and all UI flows that talk to the backend API.

## What this app covers

- Home feed with memories and live community content.
- Events feed, event creation, and event engagement.
- Messaging UI with live chat state.
- Profile pages with memories, events, gifts, and follow actions.
- Discovery flows such as find friends, matches, nearby users, and location-aware browsing.
- Store and payment screens for coins, gift cards, and checkout success.
- Admin dashboard screens for users, reports, posts, payments, interests, gift cards, and settings.
- Auth flows for login, register, OTP verification, forgot/reset password, and complete profile.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI primitives
- Lucide React icons
- React Hook Form
- Zod validation
- Sonner toasts
- next-themes
- jsonwebtoken for token decoding on the server side

## Project Structure

- `src/app` - route groups, layouts, pages, and API proxy routes.
- `src/components` - shared UI, feature components, dialogs, and feed clients.
- `src/services` - server actions that forward authenticated requests to the backend.
- `src/hooks` - custom client hooks.
- `src/lib` - helper utilities.
- `src/proxy.ts` - auth-aware routing and access control.

## Main Pages

- `/` - home feed
- `/events` - community events feed
- `/messages` - messaging center
- `/friends` - friends list
- `/find-friends` - discovery and matching
- `/matches` - match browser
- `/explore` - nearby discovery
- `/profile` and `/profile/[userId]` - profile views
- `/create-memory` and `/create-event` - content creation
- `/store` - coins and gift cards
- `/complete-profile` - onboarding flow
- `/login`, `/register`, `/verify-otp`, `/reset-password`, `/foget-password` - auth screens
- `/admin/dashboard` - admin area

## Backend Connection

This frontend expects the backend API to be available through `NEXT_PUBLIC_API_URL`.

Most server actions and route handlers call the Friendzo backend with that base URL and the user token stored in cookies.

## Environment Variables

- `NEXT_PUBLIC_API_URL` - backend base URL, for example `https://friendzo-server.onrender.com/api/v1`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps key for map and location features
- `JWT_SECRET` - used by server-side auth/proxy logic

## Scripts

- `bun run dev` or `npm run dev` - start the development server
- `bun run build` or `npm run build` - build the app
- `bun run start` or `npm run start` - run the production build
- `bun run lint` or `npm run lint` - run ESLint

## Getting Started

1. Install dependencies.
2. Set `NEXT_PUBLIC_API_URL` to the backend service.
3. Add the Google Maps key if you use map features.
4. Start the app with the dev script.
