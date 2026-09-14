# SOS Bansko

SOS Bansko is a community rapid-response platform for Bansko and the surrounding area.

Important: it does not replace 112. In a life-threatening emergency the reporter must call 112 first. SOS Bansko is designed to shorten the time until a verified nearby person can provide safe first assistance while official emergency services are responding.

## V1 included

- Mobile-first Next.js interface
- Fast incident categories for critical scenarios
- Automatic high-accuracy browser geolocation
- Photo/video capture input
- Guest reporting UX
- Responder view with `Да, тръгвам` / `Не, няма да успея`
- Forward-to-next-responder flow in the UI
- Admin/operations view
- Convex-ready schema for users, responder categories, incidents, dispatches and incident event history
- Data fields for anonymous-report trust scoring and fraud flags
- Environment placeholders for Bansko.be identity, Web Push and Telegram fallback

## Intended dispatch flow

1. Reporter selects an emergency type.
2. Location and optional media are attached.
3. Backend validates the report and calculates a trust score.
4. Approved responders are filtered by category, availability and distance.
5. The closest qualified responders receive a high-priority push notification.
6. The wider relevant responder network receives the general incident shout.
7. Responders answer `going` or `cannot respond`.
8. Unanswered priority notifications escalate to the next responders and then to Telegram fallback.
9. Every state transition is recorded in the incident event log.

## Planned account model

- `admin`: main operational account; creates and approves responder accounts.
- `responder`: verified rescue/volunteer account with one or more capabilities.
- `reporter`: authenticated Bansko.be user.
- `guest`: may report without an account and is invited to join Bansko.be after reporting.

There is intentionally no public self-approval flow for responders.

## Convex

The first database schema lives in `convex/schema.ts`. It is prepared but not connected to a live Convex deployment yet.

Suggested next implementation phase:

- create Convex deployment
- connect the Next.js provider
- incident mutations and validation
- media upload URLs/storage
- responder geo matching
- Bansko.be identity bridge
- PWA/service worker and Web Push
- Telegram Bot fallback
- anti-abuse/rate limiting and report trust scoring
- admin audit tools

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when integrations are enabled.
