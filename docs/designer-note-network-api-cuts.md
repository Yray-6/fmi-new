# Investor Network — design cuts to match the API

Hi — thank you for the Network desktop and mobile frames. We need a pass that
**removes or collapses** anything the live network API cannot return or update.
The API is the source of truth. Do not invent fields for engineering to fake.

Same look as today’s workspace (light green and white). Apply every cut on
**desktop and mobile**.

Contract reference (revamp client):  
`GET/POST/PATCH` under `/api/accounts/network/` — directory, profile, connect,
connections, my_profile.

---

## Frames this note covers

**Desktop**

- Explore: populated, empty, loading, no results  
- Profile: not connected, outgoing pending, incoming request  
- My network

**Mobile** (same content, stacked, 20px padding)

- Explore: [8598](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-8598), [8374](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-8374), [8010](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-8010), [7774](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-7774)  
- Profile: [7430](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-7430), [7084](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-7084), [6742](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-6742)  
- My network: [6309](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-6309)

---

## Mobile layout — keep as-is (do not bring desktop-only chrome back)

Mobile already omits these. Leave them out on mobile:

- Hero side column (“Invest in connection” / “Be the first”)
- “Visible to FMI members only” beside the result count
- Pagination footer (“Showing all 6” and the page badge)
- Bottom portfolio disclaimer
- “A shared starting point” panel on the profile

Mobile profile order: header → snapshot → relationship panel → sector bars →
recent investments. Keep that order.

On mobile recent investments, amount can stay on its own “Amount invested” row.
Still drop the business photo and the instrument line (see below).

---

## Remove on desktop and mobile

### Explore (browse)

| Remove | Why |
| --- | --- |
| **Request received** badge | `connection_status` is only `none`, `pending`, `accepted`, `rejected`, or `self`. Use one **Pending** badge for every pending case. |
| **Sort: Recommended** and “6 investors · Recommended for you” | No `ordering` / recommendation. Use `total_count` only, e.g. “6 investors”. |
| **Investor type** / **All investor types** filter (including “Family office” on no-results) | Directory query params are `search`, `sector`, `location`, `page` only. |
| **All relationships** filter | Same — no relationship query param. |
| Search placeholder “name, location or investor type” | Search is **name** search. Location stays its own filter. |

**Keep:** search (name), location filter, sector filter, empty / loading /
no-results, investor cards (initials from name, type, location, investment
count, portfolio value ₦, preferred sector tags, View profile), badges
**Not connected** / **Pending** / **Connected**.

### Someone else’s profile

| Remove | Why |
| --- | --- |
| “FMI member since …” (desktop badge or mobile line under sectors) | Not on the public investor profile payload. |
| “As of 30 Sep 2026” and “By current portfolio value · 30 Sep 2026” | No as-of date from the API. |
| Naira beside each sector percent (“40% · ₦85,840”) | `sector_allocation` is one number per sector (treated as percent). Keep the bar and the **percent** only. |
| Business photo on recent investments | Not in the recent-investment payload. |
| Instrument line (“Preferred equity”, “Private debt”, “Convertible note”) | Row is name, sector, date, and amount invested. |
| “0 / 250 characters” under the connect message | No defined limit. Keep the optional message field; it is sent on connect and **never shown again**. |
| Entire **outgoing** panel: “Outgoing · Pending”, requested date, “Pending approval”, **Cancel request** | Profile has no direction, request date, message, or connection id. No cancel / withdraw action. |
| Entire **incoming** panel: quoted message, “Received …”, **Accept request**, **Decline** | Same — cannot tell incoming from outgoing on the profile, and message is not returned. |

**Replace** the two pending profiles with **one Pending panel**: badge
“Pending”, short copy that a request is open, **no buttons**. Same on desktop
and mobile.

**Keep:** back link, name, type, location, bio, preferred sector tags,
investments count, amount invested, current value, percent sector bars, recent
investments as name / sector / date / amount, **Connect** + optional message
when status is not connected.

### My network

| Remove | Why |
| --- | --- |
| **Bio** and **Location** editors | `PATCH my_profile` accepts only `display_name`, `investor_category`, `preferred_sectors`. Bio/location are readable on others’ profiles; they cannot be saved here. |
| “120 / 300 characters” | No character limit from the API. |
| **Received** and **Sent** as separate metrics and lists | Connections are `{ id, investor, status, created_at }` with `pending` \| `accepted` \| `rejected`. No direction and no message. |
| Quoted request text on rows | Message is not returned. |
| **Accept** / **Decline** / **Cancel request** on this screen as designed with Incoming vs Sent | Without direction, treat all `pending` rows the same. Do not show cancel. Accept/Decline only if product later wires connection id from the connections list — for this pass, **Pending list is read-only** (status + date). |

**Replace with:**

- Summary metrics: **Pending** count and **Connections** count only (no Received / Sent).
- Editor: display name, investor type, preferred sectors, **Save profile changes**.
- Lists: one **Pending** list and one **Connections** (`accepted`) list.
- Each row: name, type, location, `created_at`. **View profile** on accepted rows.

---

## What stays (no redesign needed for these)

- Explore empty, loading, and no-results states  
- Static hero copy (“Good company…”, dark intro card)  
- Tabs: Explore investors / My network · N  
- Connect with optional message when not connected  
- Shared-interest copy is optional and can be derived client-side from overlapping preferred sectors  

---

## Suggested deliverable

1. Updated **Explore** (populated + no-results filters) — desktop and mobile  
2. One **Pending** profile panel replacing outgoing + incoming — desktop and mobile  
3. Slimmed **My network** (editor + Pending + Connections) — desktop and mobile  

Please send the revised frames when ready. Engineering will implement against
this reduced set only.
