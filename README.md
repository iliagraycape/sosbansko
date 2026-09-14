# SOS Bansko

SOS Bansko is an independent community rapid-response platform for Bansko and the surrounding area.

The system coordinates its own approved volunteer network. It is not connected to 112 and does not send incidents, location data, media or contact details to 112.

For a life-threatening emergency, the reporter should separately call 112. A SOS Bansko report may still be submitted when official services have not yet been notified.

## Reporter model

The public reporting side has two paths and neither one should slow down an SOS report:

- **Registered bansko.be user** — recognized through the bansko.be account bridge. Name and phone can be prefilled from the profile when available.
- **Guest reporter** — can submit immediately without registration. Name and callback phone are entered directly in the SOS flow.

Registration is never required before submitting an SOS report.

In the product language, **user** means a bansko.be user. Rescue personnel are not treated as public users and use a separate rescue account system.

## Rescue account model

Rescue personnel use a separate operational account system and separate dashboard.

- `chief` — highest rescue role; manages the rescue organization and access.
- `lead` — operational leader; can coordinate incidents and manage/suspend secondary responders according to permissions.
- `responder` — secondary rescue/volunteer account; receives and responds to incidents but cannot manage higher-level access.

Rescue accounts have an access status:

- `active`
- `suspended`

Suspending a rescue account removes operational access and should stop new dispatches to that account. Access changes are audited in `rescueAccessEvents` instead of deleting historical rescue identities.

There is intentionally no public self-approval flow for rescue accounts.

## Current foundation

- Mobile-first Next.js interface
- Fast critical-incident reporting
- Dedicated `Аз съм в опасност` flow
- High-accuracy browser geolocation
- Manual location fallback
- Photo/video capture input
- Registered bansko.be reporter or guest reporter flow
- Reporter name and callback phone
- Clear acknowledgement that contact details are used only for reaction to the active incident
- Optional `112 / съответната служба е уведомена` checkbox that never blocks reporting
- Separate operational-priority signal based on incident severity and whether services are marked as notified
- Critical scenarios keep a high-priority floor even when services are not marked as notified
- Reporter phone is shown directly to approved rescue personnel who receive the active incident
- One-tap phone call from the responder view
- Responder acceptance flow: `Да, тръгвам` / `Не мога` / `Пристигнах`
- Intelligent responder matching by distance, availability, skills and equipment
- Incident coordination room with responder status and resources
- Separate chief / lead / responder rescue hierarchy
- Suspend/reactivate rescue access with audit history
- Convex-ready schema for reporters, rescue accounts, incidents, dispatches, participants, location trail and event history
- Web Push and Telegram fallback placeholders

## Volunteer dispatch flow

1. Reporter enters through either a registered bansko.be identity or the guest flow.
2. Reporter selects the incident type.
3. Location and optional media are attached.
4. Reporter provides or confirms a callback number and acknowledges its incident-only use.
5. Reporter can indicate whether 112 or another appropriate service has already been notified. This is optional and never blocks the SOS Bansko report.
6. The system derives an operational priority. Critical incident severity is never downgraded below a high-priority floor merely because services are not marked as notified.
7. The system identifies suitable active rescue accounts based on the situation, availability, capabilities and distance.
8. Rescue personnel receiving the active incident can immediately see the reporter callback number and call for clarification.
9. A responder accepts or declines and then marks `en route` / `arrived` states.
10. If the first responder cannot respond, the incident is escalated to the next suitable active responder.
11. The incident room coordinates participating SOS Bansko rescue personnel and records state transitions.

## 112 boundary

SOS Bansko and 112 are separate systems.

- SOS Bansko does not automatically contact 112.
- SOS Bansko does not currently exchange incident data with 112.
- SOS Bansko does not represent an official emergency service.
- The reporter may submit to SOS Bansko before or after separately notifying 112 or another appropriate service.
- The `servicesNotified` flag is reporter-supplied context for volunteer prioritization, not proof of official dispatch or coordination.

This boundary should remain explicit in both product copy and implementation until a formal integration or cooperation model exists.

## Convex

The schema lives in `convex/schema.ts`. It separates public reporters from rescue accounts and is not connected to a live Convex deployment yet.

Core identity tables:

- `reporterAccounts` — registered bansko.be users only.
- guest reporters — represented directly on the incident through `reporterType = guest` and `guestSessionId`; they do not need an account row before reporting.
- `rescueAccounts` — chief, lead and responder operational identities.
- `rescueAccessEvents` — audit history for rescue account creation, suspension and reactivation.

Suggested next implementation phase:

- create Convex deployment
- connect the Next.js provider
- bansko.be identity bridge for registered reporters
- guest incident creation without registration
- incident mutations and validation
- media upload URLs/storage
- live responder location and status
- direct reporter callback access for rescue personnel receiving an incident
- chief/lead access-control enforcement
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
