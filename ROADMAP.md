# Oasis Yo Roadmap

This roadmap translates the current audit into a practical build sequence that moves the app toward the product vision described in `specs.md`.

## Current Reality

The app already has a solid foundation in a few areas:

- SIWE wallet authentication
- YO vault deposit and position reads
- Internal transaction ledger
- Pocket-based yield allocation
- Basic donation routing concept
- Manual/demo spare change flow

The main gap is that the product spec is much broader than the current implementation. Several features are partially represented in UI or data models, but not yet implemented end-to-end.

## Prioritized Build Order

1. Fix routing correctness and schema drift
2. Upgrade pockets into true aquifers
3. Build subscription aquifer calculator and payout flow
4. Strengthen donations with multi-router execution and NGO entities
5. Implement Tax Shield
6. Replace spare change demo mode with real connected inflow
7. Add shared aquifers and then Prize Pool
8. Add debit cards last

---

## Phase 1: Stabilize What Already Exists

Goal: make the current product trustworthy, internally consistent, and production-safe.

### Work items

- Fix `Execute Yield Routes` so all active routers execute correctly, not just the first donation router.
- Ensure subscription routers are either fully implemented or clearly labeled as not yet executable.
- Add pause, delete, and edit controls for routers in the UI using existing server actions.
- Replace hardcoded Explore strategy cards with live-backed data or clearly mark them as demo content.
- Convert runtime schema patching into proper Drizzle migrations.
- Add a real withdrawal flow or remove withdrawal language until it exists.

### Why this phase comes first

- It closes the biggest gap between what the UI promises and what the product actually does.
- It reduces technical debt before adding more complex product surfaces.
- It improves reliability without changing the core product direction.

### Success criteria

- All active yield routers execute as expected.
- Router management is fully exposed in the interface.
- Database schema is reproducible from migrations.
- Explore page no longer implies unsupported live strategy data.
- Withdrawal state is either implemented or removed from user-facing claims.

---

## Phase 2: Make Aquifers Real

Goal: evolve `pockets` from simple yield buckets into true goal-oriented aquifers.

### Work items

- Extend the current pocket model into a richer aquifer model with:
  - goal type
  - target amount or monthly expense
  - target date
  - locked/unlocked state
  - overflow rule
  - optional destination
- Keep principal and yield policy clearly separated in the data model.
- Add aquifer-level summaries in the dashboard.
- Support goal-specific UI states instead of generic percentage buckets only.

### Why this phase matters

- Aquifers are central to the product identity in `specs.md`.
- The current pockets implementation is useful, but too shallow for the actual spec.
- This phase creates the foundation for subscriptions, overflow rules, and shared goals.

### Success criteria

- Users can create named aquifers with real goal settings.
- Aquifers are more than percentage allocations.
- The dashboard shows goal-aware status, not just balances.

---

## Phase 3: Build the Subscription Aquifer

Goal: deliver the first fully productized aquifer flow.

### Work items

- Add a subscription aquifer calculator:
  - monthly target spend
  - current APY input or live APY source
  - required principal estimate
- Add destination and billing metadata for each subscription aquifer.
- Build recurring payout logic for subscription coverage.
- Show whether an aquifer is sufficiently funded to sustain the target subscription.
- Add status states like underfunded, healthy, or surplus.

### Why this phase matters

- It turns one of the most compelling spec ideas into a tangible user experience.
- It proves the aquifer model can support a real use case.
- It helps validate principal/yield separation in the product.

### Success criteria

- A user can define a monthly expense and see the principal required.
- The app can determine whether the aquifer can sustain that expense.
- Subscription payout behavior is no longer just a stored router record.

---

## Phase 4: Upgrade Donations into Lossless Giving

Goal: turn donation routing into a real philanthropy product instead of a raw transfer form.

### Work items

- Support executing multiple active donation routers correctly.
- Add NGO entities instead of relying only on free-form destination addresses.
- Build a curated NGO directory experience.
- Add impact metrics to the donation page, not just dollar totals.
- Support recurring or manually triggered donation routing.
- Add annual donation export and PDF generation for tax reporting.

### Why this phase matters

- Donations already exist in concept, so this is a natural product expansion.
- It delivers one of the clearest differentiators in the spec.
- It replaces ambiguous “impact” wording with real measurable outputs.

### Success criteria

- Users can select from a curated NGO list.
- Donation routing supports multiple active routes.
- Impact metrics are tied to donation history.
- Year-end donation records can be exported as a PDF.

---

## Phase 5: Build the Tax Shield

Goal: add the freelancer-focused automated tax protection layer.

### Work items

- Add tax rule configuration such as “route 30% of incoming deposits to tax shield.”
- Add a quarantined tax balance distinct from general balance.
- Add tax-specific yield accounting.
- Route tax-generated bonus yield into general balance.
- Add UI for quarterly readiness and tax reserve history.
- Add reporting and reminders for quarterly tax planning.

### Why this phase matters

- This is a full pillar in the spec and currently completely absent.
- It creates a strong practical use case for freelancers and contractors.
- It adds a clear habit-forming financial protection feature.

### Success criteria

- A user can set a tax percentage rule.
- Deposits can split automatically into a tax-protected balance.
- Tax reserve yield is accounted for separately and surfaced in the UI.

---

## Phase 6: Turn Spare Change Into a Real Inflow Feature

Goal: replace the manual/demo spare change flow with real connected transaction ingestion.

### Work items

- Add bank or card transaction ingestion.
- Preserve the current manual entry flow as sandbox mode only.
- Add recurring automatic sweep behavior.
- Connect spare-change inflows directly into the same wealth and routing model used by the rest of the app.
- Add feed health states such as connected, syncing, delayed, or disconnected.

### Why this phase matters

- Spare change is already present in the UI, but currently demo-driven.
- Converting it into a connected flow makes the inflow engine much more real.
- It strengthens the “set and forget” value proposition.

### Success criteria

- Users can connect a transaction source.
- Round-ups are generated from actual inflow data.
- Sweeps can happen automatically without manual transaction entry.

---

## Phase 7: Add Shared Aquifers and Prize Pool

Goal: expand the app from solo wealth orchestration into collaborative and community features.

### Shared Aquifers work items

- Add shared aquifer entities with:
  - owner
  - invitees or participants
  - contributions
  - unlock rule
  - return-of-principal flow
- Build contribution and payout tracking.
- Add shared-goal status UI.

### Prize Pool work items

- Add prize pool opt-in amount.
- Add pooled-yield accounting.
- Add weekly draw lifecycle.
- Add winner selection and jackpot distribution history.
- Add historical transparency around draws and outcomes.

### Why this phase matters

- These features are product differentiators, but they depend on more mature accounting and user models.
- Shared ownership and prize systems are more complex, so they should come after the individual core flows are stable.

### Success criteria

- Multiple users can participate in one aquifer with tracked contributions.
- Prize pool balances and draw outcomes are transparent and auditable.

---

## Phase 8: Add Yield-Powered Debit Cards

Goal: deliver the long-term spending rail that makes aquifers feel seamless in everyday life.

### Work items

- Add virtual debit card support tied to specific aquifers.
- Add card-specific spend controls and merchant routing rules.
- Allow subscription aquifers to pay via the virtual card rail.
- Add balance and spend protection so principal remains insulated.

### Why this phase comes last

- It depends on mature aquifer logic and outflow controls.
- It is operationally and technically heavier than the earlier phases.
- It is a roadmap feature, not a prerequisite for validating the core product.

### Success criteria

- A user can attach a virtual card to a specific aquifer.
- Spending rules enforce yield-only behavior.
- Subscription-style payments can run through the card rail safely.

---

## Cross-Cutting Technical Work

These items should be handled alongside product phases.

- Clean migration discipline so schema and runtime behavior do not drift.
- Better financial state modeling for principal, earned yield, allocated yield, and routed yield.
- Clear audit logs for all automated routing and payouts.
- Better status/error UX around deposit, redeem, sweep, and route operations.
- Stronger distinction between demo data and real financial actions.

---

## Suggested Milestone Sequence

### Milestone A

- Phase 1 complete
- Routing logic trustworthy
- Schema reproducible
- UI claims aligned with implementation

### Milestone B

- Phase 2 complete
- Aquifers become real product objects
- Goal-aware UX is in place

### Milestone C

- Phase 3 complete
- Subscription aquifer becomes the first end-to-end flagship flow

### Milestone D

- Phase 4 and Phase 5 complete
- Lossless Giving and Tax Shield become major differentiators

### Milestone E

- Phase 6 and Phase 7 complete
- Real inflow automation and community features are live

### Milestone F

- Phase 8 complete
- Debit-card-powered yield spending becomes available

---

## Immediate Next Recommendations

If work starts now, the best next steps are:

1. Fix router execution correctness.
2. Write proper migrations for all current runtime-created tables and columns.
3. Redesign the current pocket model into a real aquifer schema.
4. Decide the first flagship aquifer flow, which should be the subscription aquifer.

## Final Note

The strongest path forward is to avoid building every spec item at once. First make the current app accurate and reliable, then turn aquifers into a robust core abstraction, and then layer specialized flows like subscriptions, donations, taxes, community pooling, and cards on top of that foundation.
