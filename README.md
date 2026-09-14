# SOS Bansko

SOS Bansko is an independent community rapid-response platform for Bansko and the surrounding area.

The system coordinates its own approved volunteer network. It is not connected to 112 and does not send incidents, location data, media or contact details to 112.

For a life-threatening emergency, the reporter should separately call 112. A SOS Bansko report may still be submitted when official services have not yet been notified.

## Current foundation

- Mobile-first Next.js interface
- Fast critical-incident reporting
- Dedicated `Аз съм в опасност` flow
- High-accuracy browser geolocation
- Manual location fallback
- Photo/video capture input
- Reporter name and callback phone
- Clear acknowledgement that contact details are used only for reaction to the active incident
- Optional `112 / съответната служба е уведомена` checkbox that never blocks reporting
- Separate operational-priority signal based on incident severity and whether services are marked as notified
- Critical scenarios keep a high-priority floor even when services are not marked as notified
- Reporter phone is shown directly to approved volunteers who receive the active incident
- One-tap phone call from the responder view
- Responder acceptance flow: `Да, тръгвам` / `Не мога` / `Пристигнах`
- Intelligent responder matching by distance, availability, skills and equipment
- Incident coordination room with responder status and resources
- Admin/operations view
- Convex-ready schema for incidents, dispatches, participants, location trail and event history
- Web Push and Telegram fallback placeholders

## Volunteer dispatch flow

1. Reporter selects the incident type.
2. Location and optional media are attached.
3. Reporter provides a callback number and acknowledges its incident-only use.
4. Reporter can indicate whether 112 or another appropriate service has already been notified. This is optional and never blocks the SOS Bansko report.
5. The system derives an operational priority. Critical incident severity is never downgraded below a high-priority floor merely because services are not marked as notified.
6. The system identifies suitable approved volunteers based on the situation, availability, capabilities and distance.
7. Volunteers receiving the active incident can immediately see the reporter callback number and call for clarification.
8. A volunteer accepts or declines and then marks `en route` / `arrived` states.
9. If the first volunteer cannot respond, the incident is escalated to the next suitable volunteer.
10. The incident room coordinates participating SOS Bansko volunteers and records state transitions.

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
- The reporter may submit to SOS Bansko before or after separately notifying 112 or another appropriate service.
- The `servicesNotified` flag is reporter-supplied context for volunteer prioritization, not proof of official dispatch or coordination.

This boundary should remain explicit in both product copy and implementation until a formal integration or cooperation model exists.

## Convex

The schema lives in `convex/schema.ts`. It is prepared for the reaction-engine model but is not connected to a live Convex deployment yet.

Suggested next implementation phase:

- create Convex deployment
- connect the Next.js provider
- incident mutations and validation
- media upload URLs/storage
- live responder location and status
- direct reporter callback access for volunteers receiving an incident
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
