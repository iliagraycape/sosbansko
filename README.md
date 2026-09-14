# SOS Bansko

SOS Bansko is an independent community rapid-response platform for Bansko and the surrounding area.

The system coordinates its own approved volunteer network. It is not connected to 112 and does not send incidents, location data, media or contact details to 112.

For a life-threatening emergency, the reporter should separately call 112. SOS Bansko is intended to help nearby approved volunteers react quickly while the local volunteer team coordinates through the app.

## Current foundation

- Mobile-first Next.js interface
- Fast critical-incident reporting
- Dedicated "Аз съм в опасност" flow
- High-accuracy browser geolocation
- Manual location fallback
- Photo/video capture input
- Reporter name and callback phone
- Responder acceptance flow: `Да, тръгвам` / `Не мога` / `Пристигнах`
- Protected reporter chat after a responder accepts an incident
- Protected reporter phone access after a responder accepts an incident
- Intelligent responder matching by distance, availability, skills and equipment
- Incident coordination room with responder status and resources
- Admin/operations view
- Convex-ready schema for incidents, dispatches, participants, chat, location trail and event history
- Web Push and Telegram fallback placeholders

## Volunteer dispatch flow

1. Reporter selects the incident type.
2. Location and optional media are attached.
3. The system identifies suitable approved volunteers based on the situation, availability, capabilities and distance.
4. The highest-priority volunteers receive the incident.
5. A volunteer accepts or declines.
6. After acceptance, that volunteer can open a private chat with the reporter and request access to the reporter's callback number.
7. The volunteer marks `en route` and `arrived` states.
8. If the first volunteer cannot respond, the incident is escalated to the next suitable volunteer.
9. The incident room coordinates the participating SOS Bansko volunteers.
10. Every state transition is recorded in the incident event log.

## Account model

- `admin`: operational account that creates and approves volunteer/responder accounts.
- `responder`: approved volunteer with defined capabilities and equipment.
- `reporter`: authenticated Bansko.be user.
- `guest`: may report without an account.

There is intentionally no public self-approval flow for responders.

## 112 boundary

SOS Bansko and 112 are separate systems.

- SOS Bansko does not automatically contact 112.
- SOS Bansko does not currently exchange incident data with 112.
- SOS Bansko does not represent an official emergency service.
- When 112 is appropriate, the user should call 112 separately.

This boundary should remain explicit in both product copy and implementation until a formal integration or cooperation model exists.

## Convex

The schema lives in `convex/schema.ts`. It is prepared for the reaction-engine model but is not connected to a live Convex deployment yet.

Suggested next implementation phase:

- create Convex deployment
- connect the Next.js provider
- incident mutations and validation
- media upload URLs/storage
- live responder location and status
- protected incident chat
- protected reporter contact access
- Bansko.be identity bridge
- PWA/service worker and Web Push
- Telegram Bot fallback
- anti-abuse/rate limiting
- admin audit tools

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when integrations are enabled.
