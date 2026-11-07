# FMI design request — screens we still need

Hi — this is a short brief for design work still open for the FMI app. Please keep the same look as today’s workspace (light green and white, existing fonts and accent). Don’t use the old dark revamp look.

---

## What’s already built (no need to redesign)

- Overview home  
- Marketplace browse + saved watchlist  
- Opportunity detail (including request info and pledges)  
- Secondary market list (sell / buy interest / transfers)  
- Portfolio, analytics, account & security  
- Notifications in the header  

Wallet is hidden on purpose for now.

---

## Design delivered

### 1. Investor Network

**Status:** Desktop and mobile delivered. This is the new FMI redesign of old revamp **Pi** (`/pi`) — browse investors, open a profile, and connect — under **Connect / Investor Network** (Explore, profile, My network).

**In app:** `/network`, `/network/[id]`, `/network/mine`, with **Network** in the left menu and mobile menu (Wallet still off).

Design’s remaining step is not a full redesign: **revise the frames so they only show what the live network API can return or update.**

Full cut list: [designer-note-network-api-cuts.md](./designer-note-network-api-cuts.md).

In short: one Pending state (no Request received / Accept / Decline / Cancel on profile), search + location + sector only, percent-only sector bars, My network editor limited to name / type / sectors, Pending + Connections lists only.

### 2. Secondary market — listing detail

**Status:** Desktop and mobile delivered.

Figma:

- Desktop: [Workspace content · listing detail](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-6132)  
- Mobile: [Workspace content · listing detail](https://www.figma.com/design/kl5sg5xjnKcxiJkg1WWG9B/Canvas-?node-id=3604-5888)

Checked against the brief — frames cover:

- Business / investment name and sector  
- Seller name (plus note / reason for selling)  
- Full or partial transfer, with % when partial  
- Price, fees, and buyer net payable  
- Risk, term, and return when shown  
- Status and key dates  
- Link back to the related marketplace opportunity  
- Main CTA: **Express interest**  
- Desktop two columns; mobile stacked (purchase summary first)

**In app:** list **Review listing** opens `/marketplace/secondary/[id]` (Express interest on the detail page).

---

## What we still need from design

### 3. Profile photo on Account

On the existing Account page (not a new page):

- A circular photo / avatar at the top of the profile  
- If there’s no photo, show initials  
- Ability to upload or replace a photo  
- Simple states: uploading, success, error  

---

## Please don’t design

These are for staff / admin tools, not the investor app:

- Creating or deleting investments for someone else  
- Approving or completing transfers as staff  
- Wallet deposit / withdrawal flows (no product support yet)

---

## Suggested order

1. Investor Network — API revision of the delivered frames ([cut list](./designer-note-network-api-cuts.md))  
2. Account profile photo  

---

## What to send back

- Revised Network (Explore, one Pending profile, My network) — desktop and mobile, per the cut list  
- Account photo states (empty, uploaded, uploading, error)  
- Updated menu showing **Network**, still without **Wallet** (if not already in shell frames)
