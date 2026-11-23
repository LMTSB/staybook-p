# SpatialStay — Product Manager Review

**Review date:** 23 November 2026  
**Review scope:** Prototype quality, customer journey, commercial readiness, and delivery risks.

## Executive assessment

The prototype demonstrates the core proposition clearly: a guest can discover a room, inspect an interactive 3D layout and window view, review room facts, and see an itemized price before a simulated booking confirmation.

**Recommendation: suitable for user interviews and usability testing; not ready for live transactions or public launch.** The most important product differentiator is not simply "hotel booking"—a crowded category—but trustworthy room-level transparency: the exact room type, actual window view, measured area, occupancy, and clear total price.

## What is in the demo

| Area | Assessment |
|---|---|
| Passwordless-style entry | Simulated OTP; no identity verification |
| Room discovery | Three fictional Bangkok sample listings |
| Room detail | Size, bed, occupancy, amenities, photos |
| 3D room experience | Three.js WebGL interactive viewer; orbit, zoom, cutaway floor plan, lighting modes, dimension tags, fullscreen |
| Exterior view | Per-listing skyline, courtyard garden, or river backdrop |
| Price calculation | Nightly subtotal + sample service fee + sample VAT |
| Checkout | Guest form and simulated confirmation |
| Responsive layout | Desktop and mobile CSS layouts |

## Key risks and gaps before launch

### P0 — Must resolve before accepting real bookings
1. **Real inventory and room assignment:** connect a property-management system (PMS) or channel manager; prevent double bookings and stale availability.
2. **Truthful 3D media:** capture each actual room type and the actual view from that room. Label floor, orientation, view category, capture date, and whether the shown room is the exact assignable room or a representative room type.
3. **Payment lifecycle:** integrate a compliant payment provider; support payment status, failed payments, refunds, cancellations, receipts, and reconciliation. Never store card data directly.
4. **Legal/tax review in Thailand:** validate service fee/VAT basis, tax invoices, consumer disclosures, privacy notice, consent, retention, and cancellation terms with qualified advisors.
5. **Security and privacy:** replace demo OTP with secure server-side authentication, rate limits, short-lived codes, session management, and audit logs.

### P1 — Needed for a credible MVP
1. Add a hotel/host onboarding dashboard for room data, rates, blackout dates, and 3D model upload.
2. Add room comparison: actual floor area, bed configuration, view type, occupancy, accessibility, and cancellation terms.
3. Show a complete final price early in the journey, not only at checkout; clearly distinguish taxes, platform fee, property fee, and optional extras.
4. Add booking states: pending, confirmed, failed, cancelled, refunded, and expired.
5. Add media quality controls: model polycount/texture validation, mobile loading performance, and fallbacks.
6. Add analytics: search-to-detail conversion, 3D engagement, booking conversion, abandonment, cancellation, and dispute rates.

## Release gate

Do not label the product production-ready until the following are complete:
- [ ] Real property and room data agreements
- [ ] Real, rights-cleared 3D room models and window captures
- [ ] Availability synchronization and booking locking
- [ ] Payment provider and refund/cancellation workflow
- [ ] Reviewed Thai tax and consumer disclosures
- [ ] PDPA/privacy and security review
- [ ] Mobile performance and accessibility testing
- [ ] Customer support and dispute process
