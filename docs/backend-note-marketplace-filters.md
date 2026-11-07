# Marketplace & secondary filters — verification vs OpenAPI

Checked against PrivCap Hub OpenAPI `1.0.0` (paths for  
`GET /api/marketplace/opportunities/` and `GET /api/secondary-market/`).

**Verdict: backend delivered the filter set; FMI now sends the full query set
on primary and secondary** (multi `sector`, `risk_level`, `investment_type`,
`max_min_investment`, `ordering` / secondary `search`+`ordering`). Structure UI
is Fixed/Variable; risk UI is Low/Medium/High.

---

## Primary — `GET /api/marketplace/opportunities/`

| Param | OpenAPI | Status |
| --- | --- | --- |
| `search` | Text on title, description, sector, investment type | Done · FMI sends |
| `sector` | Codes; repeat or comma-separate; OR | Done · FMI sends **one** code only |
| `risk_level` | `LOW` \| `MEDIUM` \| `HIGH`; multi; OR | Done · FMI not sending yet |
| `investment_type` | `FIXED` \| `VARIABLE`; multi; OR | Done · see mismatch below |
| `max_min_investment` | `min_investment <=` value | Done · FMI not sending yet |
| `ordering` | `featured` (default) \| `closing` \| `min_investment` \| `title` \| `newest`; `-` reverses | Done · FMI sorts client-side |
| `status` | `NEW` \| `ACTIVE` \| `CLOSING_SOON`; multi | Done (extra) · FMI not using |
| `page` | Pagination | Done · FMI uses via `fetchAllPages` |

### Mismatches to resolve on FMI (or with product)

1. **Structure UI ≠ `investment_type`**  
   FMI filter chips are “Private debt”, “Preferred equity”, “Ordinary equity”, etc.  
   API only filters `FIXED` / `VARIABLE`. Those labels cannot be sent as
   `investment_type`. Options: change UI to Fixed / Variable, or keep structure
   as client-only post-filter on `investment_type_display`.

2. **Risk labels ≠ enum**  
   FMI shows Moderate / Moderate–high / High. API is `LOW` / `MEDIUM` / `HIGH`.  
   Map on the client (e.g. Moderate→`MEDIUM`, High→`HIGH`; Moderate–high has no
   dedicated code — treat as `MEDIUM`+`HIGH` or drop that chip).

3. **List payload may omit risk**  
   OpenAPI `MarketplaceOpportunityList` does **not** declare `risk_level` /
   `risk_level_display` (detail schema does). If production list responses also
   omit them, marketplace cards and risk chips break unless list serializer
   includes those fields. Please confirm list JSON includes `risk_level` (+
   display) or add them.

---

## Secondary — `GET /api/secondary-market/`

| Param | OpenAPI | Status |
| --- | --- | --- |
| `search` | Name + sector code/label | Done · FMI still client-side |
| `sector` | Codes; multi; OR | Done · FMI still client-side |
| `transfer_type` | `FULL` \| `PARTIAL`; multi | Done · FMI not sending |
| `min_amount` / `max_amount` | On `transfer_amount` | Done · FMI not sending |
| `ordering` | `featured` / `newest` (default) \| `asking` \| `transfer_amount` \| `name` | Done · FMI sorts client-side |
| `page` | Pagination | Done |

No blocking contract gaps vs our ask. Amount range and search match the note.

---

## Frontend follow-up (when ready)

1. Extend `fetchOpportunities` / `useMarketplaceOpportunities` with  
   `risk_level`, `investment_type`, `max_min_investment`, `ordering`, multi `sector`.
2. Pass secondary `search`, `sector`, `ordering` (and amount range if UI needs it)
   from the secondary page instead of filtering the full list in memory.
3. Align structure / risk chips with API enums (or document client-only filters).
4. Confirm list responses include `risk_level` for cards.

---

## Out of scope

Watchlist filters, Network / Pi search, secondary detail screens, wallet.
