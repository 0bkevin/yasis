# Oasis Yo Engineering Plan

This document turns `ROADMAP.md` into an execution-ready engineering plan. It is organized by implementation phases and broken down into schema, server, UI, infrastructure, and validation work.

The plan assumes the current app foundation remains in place:

- Next.js App Router frontend
- SIWE auth and wallet session handling
- YO protocol deposit and redeem integrations
- Drizzle + libSQL database layer
- Existing dashboard routes and React Query data fetching

## Delivery Principles

- Keep schema migrations authoritative; do not rely on runtime `ALTER TABLE` or `CREATE TABLE IF NOT EXISTS` for product tables.
- Separate demo-only workflows from real-money workflows at both the data and UI layer.
- Model principal, earned yield, allocated yield, and routed yield explicitly.
- Prefer additive migrations and backward-compatible UI rollouts.
- Treat all routing and payout logic as audit-sensitive flows with durable logs.

---

## Phase 1: Stabilize Existing Product Surface

Goal: make current routing, schema, and UX behavior consistent with what the app claims to do.

### 1.1 Schema Tasks

- Create a proper migration for `user_transactions`.
- Create a proper migration for `spare_bank_transactions`.
- Add `balance_usdc` to `pockets` in a real migration instead of runtime patching.
- Review `yield_routers` and add missing metadata needed for safe execution, such as:
  - `frequency`
  - `last_executed_at`
  - `execution_mode`
  - `failure_count`
- Add an execution log table, for example `yield_router_executions`, with:
  - `id`
  - `router_id`
  - `wallet_address`
  - `status`
  - `amount_usdc`
  - `tx_hash`
  - `error_message`
  - `executed_at`

### 1.2 Server and Domain Tasks

- Remove runtime schema mutation from:
  - `src/lib/wealth.ts`
  - `src/actions/user-data.ts`
- Refactor yield routing so execution is deterministic and loops through all eligible active routers.
- Split routing into distinct steps:
  - eligibility calculation
  - redeem amount calculation
  - payout dispatch
  - transaction logging
  - execution logging
- Add a dedicated server-side router execution service instead of embedding the routing behavior directly in `DashboardOverview`.
- Add validation rules for router types so a `subscription` router cannot be treated like a donation transfer.
- Add server actions or route handlers for:
  - updating a yield router
  - pausing a yield router
  - deleting a yield router
  - listing router execution history
- Add a first-pass withdrawal domain model decision:
  - either implement withdrawals end to end
  - or remove withdrawal transaction usage until it is supported

### 1.3 UI Tasks

- Update the dashboard router card in `src/components/dashboard/DashboardOverview.tsx` so it does not imply complete automation unless complete automation exists.
- Add router management controls to the donations and dashboard experience:
  - pause
  - resume
  - edit
  - delete
- Surface execution history and last-run status in the UI.
- Add clearer labels for router types so users understand what is executable now versus planned.
- Update the Explore page to distinguish:
  - live YO data
  - illustrative or static strategy content

### 1.4 Infrastructure Tasks

- Create a migration checklist for local, preview, and production database rollout.
- Add error telemetry around deposit, redeem, transfer, and routing failures.
- Add transaction-safe logging around redeem and payout operations.
- Add feature flags for any UI that is currently aspirational.

### 1.5 Validation Tasks

- Add unit tests for router eligibility and payout amount calculations.
- Add integration tests for:
  - multiple active donation routers
  - insufficient available yield
  - paused routers
  - failed payout handling
- Add manual QA scenarios for dashboard routing and transaction history correctness.

### 1.6 Current Code Areas to Change

- `src/components/dashboard/DashboardOverview.tsx`
- `src/actions/user-config.ts`
- `src/actions/user-data.ts`
- `src/lib/wealth.ts`
- `src/db/schema.ts`
- `drizzle/0000_striped_chamber.sql`

---

## Phase 2: Convert Pockets Into True Aquifers

Goal: replace simple percentage buckets with a richer goal-account model.

### 2.1 Schema Tasks

- Replace or evolve `pockets` into `aquifers` with fields such as:
  - `id`
  - `wallet_address`
  - `name`
  - `type` (`general`, `subscription`, `goal`, `shared`, `charity`, `tax`)
  - `status` (`draft`, `active`, `paused`, `completed`, `unlocked`)
  - `allocation_percent`
  - `balance_usdc`
  - `target_amount_usdc`
  - `target_monthly_outflow_usdc`
  - `target_date`
  - `unlock_at`
  - `destination_type`
  - `destination_reference`
  - `overflow_mode`
  - `created_at`
  - `updated_at`
- Add an `aquifer_events` table for balance changes, status changes, and automation events.
- Add an `aquifer_overflow_rules` table if overflow logic becomes complex enough to warrant independent rule storage.

### 2.2 Server and Domain Tasks

- Create a dedicated aquifer service layer responsible for:
  - creating aquifers
  - updating aquifers
  - validating allocation totals
  - calculating aquifer state
  - handling overflow behavior
- Replace pocket-specific server actions with aquifer-oriented actions.
- Define the canonical financial model for aquifers:
  - principal stored at vault level
  - yield allocated internally by accounting rules
  - optional outflow targets per aquifer
- Add an aquifer summary calculator that returns:
  - allocated balance
  - target status
  - funding health
  - overflow state

### 2.3 UI Tasks

- Replace the current `EditPocketsModal` with an aquifer editor flow.
- Add aquifer creation UX with type selection and goal metadata.
- Update `src/app/dashboard/pockets/page.tsx` into an aquifer management page.
- Add new visual states for:
  - goal progress
  - surplus
  - underfunded
  - locked
  - completed
- Update dashboard summary cards to show aquifer-aware information instead of percentage-only allocations.

### 2.4 Infrastructure Tasks

- Add migration scripts to move existing pocket rows into the new aquifer table shape.
- Create data backfill scripts for legacy balances and percentages.
- Add analytics events for aquifer creation, update, pause, and completion.

### 2.5 Validation Tasks

- Test migration of existing `pockets` data into aquifers.
- Test percentage allocation rules and edge-case rounding.
- Test aquifer state transitions.
- Add visual QA for aquifer dashboard cards on desktop and mobile.

### 2.6 Current Code Areas to Change

- `src/components/dashboard/EditPocketsModal.tsx`
- `src/app/dashboard/pockets/page.tsx`
- `src/components/dashboard/DashboardOverview.tsx`
- `src/actions/user-config.ts`
- `src/actions/user-wealth.ts`
- `src/lib/wealth.ts`
- `src/db/schema.ts`

---

## Phase 3: Build Subscription Aquifer End-to-End

Goal: make subscription coverage the first complete aquifer use case.

### 3.1 Schema Tasks

- Add a `subscription_profiles` table or aquifer subtype fields for:
  - `aquifer_id`
  - `merchant_name`
  - `billing_reference`
  - `billing_day`
  - `target_monthly_amount_usdc`
  - `destination_address` or external payment reference
  - `status`
- Add `required_principal_snapshot_usdc` and `estimated_apy_bps` for explainable planning.
- Add a `scheduled_outflows` table for upcoming and executed subscription payments.

### 3.2 Server and Domain Tasks

- Build a principal calculator service using:
  - target monthly spend
  - current or recent APY
  - safety buffer
- Add status evaluation logic:
  - underfunded
  - healthy
  - surplus
- Add recurring outflow generation logic for subscription due dates.
- Add support for two execution modes:
  - internal simulated payout for MVP
  - external payout integration later
- Define how a failed scheduled payout is surfaced and retried.

### 3.3 UI Tasks

- Add a subscription aquifer creation wizard.
- Show required principal estimate before saving.
- Add subscription aquifer detail view showing:
  - target amount
  - required principal
  - current health
  - next payout date
  - payout history
- Update the dashboard to highlight subscription coverage status.

### 3.4 Infrastructure Tasks

- Add a scheduled job mechanism for recurring payout generation.
- Add retry and idempotency protections for scheduled payouts.
- Add alerting for payout failures.

### 3.5 Validation Tasks

- Unit test required principal calculations across multiple APYs.
- Integration test subscription creation and lifecycle.
- Test monthly rollover logic and failed payout behavior.

### 3.6 Current Code Areas to Change

- `src/components/dashboard/CreateRouterModal.tsx`
- `src/components/dashboard/DashboardOverview.tsx`
- `src/app/dashboard/pockets/page.tsx`
- `src/db/schema.ts`
- new scheduled-job entrypoints

---

## Phase 4: Turn Donations Into Lossless Giving

Goal: replace raw donation transfers with a curated and trackable giving product.

### 4.1 Schema Tasks

- Add `ngos` table with fields such as:
  - `id`
  - `slug`
  - `name`
  - `description`
  - `wallet_address`
  - `category`
  - `status`
  - `impact_unit_label`
  - `impact_unit_per_usdc`
  - `logo_url`
- Add `donation_commitments` table for user-to-NGO allocations.
- Add `donation_receipts` table for executed donations and tax reporting.
- Add `ngo_impact_snapshots` table if impact multipliers need historical versioning.

### 4.2 Server and Domain Tasks

- Add CRUD for curated NGOs, likely admin-managed.
- Add donation routing logic that can process all active donation commitments.
- Replace free-form donation destination usage with NGO references where appropriate.
- Add impact calculation service based on NGO multipliers.
- Add annual donation statement generator and PDF export pipeline.

### 4.3 UI Tasks

- Replace “New Endowment” free-form flow with:
  - NGO browsing
  - NGO detail view
  - donation commitment setup
- Update `src/app/dashboard/donations/page.tsx` to show:
  - supported NGOs
  - active commitments
  - lifetime donated
  - impact metrics
  - export tax statement action
- Add donation history details and receipt views.

### 4.4 Infrastructure Tasks

- Add object storage or persistent file delivery for generated PDFs.
- Add admin seed or ingestion flow for NGO data.
- Add analytics around NGO selection and giving conversion.

### 4.5 Validation Tasks

- Test donation routing across multiple active NGOs.
- Test impact metric calculations and display.
- Test tax PDF generation for annual donation records.

### 4.6 Current Code Areas to Change

- `src/app/dashboard/donations/page.tsx`
- `src/components/dashboard/CreateRouterModal.tsx`
- `src/components/dashboard/DashboardOverview.tsx`
- `src/actions/user-config.ts`
- `src/actions/user-data.ts`
- `src/db/schema.ts`

---

## Phase 5: Build the Tax Shield

Goal: add automated tax protection for freelancers and independent workers.

### 5.1 Schema Tasks

- Add `tax_profiles` table with:
  - `wallet_address`
  - `routing_percent`
  - `jurisdiction`
  - `filing_frequency`
  - `safe_harbor_mode`
  - `is_enabled`
- Add `tax_reserve_ledger` table for protected tax balance accounting.
- Add `tax_yield_events` table for yield earned by tax reserves.
- Add `tax_quarter_snapshots` table for quarterly readiness views.

### 5.2 Server and Domain Tasks

- Add deposit-splitting logic that routes a configured percent of qualifying deposits into tax reserve accounting.
- Define what counts as a taxable inflow versus a general deposit.
- Add bonus-yield logic that credits tax-generated yield into general balance.
- Add quarterly summary generation and alerts.
- Add tax reserve status calculations:
  - on track
  - under-reserved
  - surplus

### 5.3 UI Tasks

- Add a Tax Shield setup page or dashboard section.
- Add controls for routing percentage and tax mode.
- Show reserve balance, estimated quarterly obligation, and bonus yield earned.
- Add reserve transaction history and period summaries.

### 5.4 Infrastructure Tasks

- Add scheduled quarterly summary generation.
- Add notification plumbing for tax reminders.
- Add secure export capability for tax summaries.

### 5.5 Validation Tasks

- Test deposit split calculations.
- Test tax reserve yield accounting.
- Test quarter-end summaries and status calculations.

### 5.6 New Areas to Introduce

- new tax route/page under `src/app/dashboard`
- new tax actions and domain services
- new tax schema modules or expanded `src/db/schema.ts`

---

## Phase 6: Replace Demo Spare Change With Connected Inflow

Goal: move from manual/demo spare transactions to real transaction ingestion.

### 6.1 Schema Tasks

- Extend `spare_bank_transactions` to include:
  - external transaction ID
  - account source ID
  - sync batch ID
  - ingest source
  - duplicate-detection hash
- Add `linked_accounts` table for bank/card sources.
- Add `sync_runs` table for connection and ingestion health.

### 6.2 Server and Domain Tasks

- Build transaction ingestion adapters for connected financial sources.
- Add deduplication and replay-safe ingestion logic.
- Add auto round-up calculation pipeline from real transactions.
- Add automatic sweep scheduling.
- Preserve manual entry as `sandbox` mode, clearly separated from real data.

### 6.3 UI Tasks

- Update `src/app/dashboard/spare-change/page.tsx` with:
  - linked account setup
  - account status
  - sync status
  - latest imported transactions
  - sandbox/manual mode toggle
- Add sweep settings for manual versus automatic behavior.

### 6.4 Infrastructure Tasks

- Add webhook or polling support for transaction source sync.
- Add secure credential storage for account connections.
- Add job processing for ingestion and sweep scheduling.

### 6.5 Validation Tasks

- Test duplicate transaction handling.
- Test delayed sync behavior.
- Test automatic sweep timing and accounting integrity.

### 6.6 Current Code Areas to Change

- `src/app/dashboard/spare-change/page.tsx`
- `src/actions/user-data.ts`
- `src/db/schema.ts`

---

## Phase 7: Add Shared Aquifers and Prize Pool

Goal: expand the app into collaborative and community financial products.

### 7.1 Shared Aquifers Schema Tasks

- Add `shared_aquifers` or enrich `aquifers` for multi-user support.
- Add `aquifer_participants` table with:
  - `aquifer_id`
  - `wallet_address`
  - `role`
  - `contribution_usdc`
  - `joined_at`
- Add `aquifer_invitations` table.
- Add `unlock_conditions` or unlock policy fields.

### 7.2 Shared Aquifers Server and Domain Tasks

- Add invite, join, leave, and contribution flows.
- Add shared-goal funding progress calculations.
- Add unlock and return-of-principal logic.
- Add participant-level ledger events.

### 7.3 Prize Pool Schema Tasks

- Add `prize_pools` table.
- Add `prize_pool_entries` table.
- Add `prize_draws` table.
- Add `prize_payouts` table.

### 7.4 Prize Pool Server and Domain Tasks

- Add opt-in flow from general balance or configured yield.
- Add weekly pool close and draw lifecycle.
- Add winner selection mechanism and audit trail.
- Add payout distribution records.

### 7.5 UI Tasks

- Add shared aquifer creation and invitation management screens.
- Add community prize pool dashboard with:
  - participation status
  - current pot estimate
  - prior draw history
  - user winnings history

### 7.6 Infrastructure Tasks

- Add scheduler support for weekly draw jobs.
- Add tamper-evident logging for draw outcomes.
- Add admin tooling for prize pool operations and support.

### 7.7 Validation Tasks

- Test multi-user contribution accounting.
- Test unlock and principal-return correctness.
- Test draw lifecycle and payout visibility.

---

## Phase 8: Add Yield-Powered Debit Cards

Goal: build the spending rail that lets aquifers fund real-world payments safely.

### 8.1 Schema Tasks

- Add `virtual_cards` table with:
  - `id`
  - `wallet_address`
  - `aquifer_id`
  - `status`
  - `spend_limit_usdc`
  - `merchant_restrictions`
  - `created_at`
- Add `card_authorizations` table.
- Add `card_settlements` table.
- Add `card_controls` table if rule complexity grows.

### 8.2 Server and Domain Tasks

- Add aquifer-to-card linking rules.
- Enforce yield-only or aquifer-only spend policies.
- Add authorization and settlement reconciliation.
- Add failed authorization handling and controls.

### 8.3 UI Tasks

- Add card setup and management screens.
- Add spend controls and merchant restrictions UI.
- Add real-time card activity and settlement history.
- Allow subscription aquifers to use card rails where supported.

### 8.4 Infrastructure Tasks

- Integrate with card issuance provider.
- Add secure token handling and compliance-sensitive event logging.
- Add fraud-monitoring and spend-alert hooks.

### 8.5 Validation Tasks

- Test aquifer-linked authorization rules.
- Test settlement reconciliation.
- Test failure and freeze states.

---

## Cross-Phase Workstreams

These should run alongside all phases.

### A. Financial Accounting Model

- Define a single source of truth for:
  - deposited principal
  - withdrawn principal
  - earned yield
  - allocated yield
  - routed yield
  - protected balances by purpose
- Stop relying only on loosely inferred totals from transaction kinds where richer state is needed.

### B. Auditability

- Add durable logs for all automated actions.
- Ensure each routing or payout event has a traceable record.
- Make UI histories reflect the true execution model.

### C. Scheduling and Automation

- Standardize job infrastructure for:
  - subscription payouts
  - donation routing
  - spare change sweeps
  - tax summaries
  - prize draws

### D. Security and Risk Controls

- Add idempotency keys for all payout-like actions.
- Add retry rules with dead-letter handling.
- Add guardrails for insufficient balance, duplicate execution, and partial failure.

### E. Product Honesty

- Ensure all UI copy reflects current execution reality.
- Use feature flags or “coming soon” states for unimplemented flows.

---

## Recommended File and Module Evolution

### Keep, but Refactor

- `src/components/dashboard/DashboardOverview.tsx`
- `src/actions/user-config.ts`
- `src/actions/user-data.ts`
- `src/actions/user-wealth.ts`
- `src/lib/wealth.ts`
- `src/db/schema.ts`

### Likely New Domain Modules

- `src/lib/aquifers.ts`
- `src/lib/router-execution.ts`
- `src/lib/subscriptions.ts`
- `src/lib/donations.ts`
- `src/lib/tax-shield.ts`
- `src/lib/spare-change-sync.ts`
- `src/lib/prize-pool.ts`
- `src/lib/cards.ts`

### Likely New Action Modules

- `src/actions/aquifers.ts`
- `src/actions/routers.ts`
- `src/actions/donations.ts`
- `src/actions/tax-shield.ts`
- `src/actions/spare-change.ts`

### Likely New Dashboard Routes

- `src/app/dashboard/aquifers`
- `src/app/dashboard/tax-shield`
- `src/app/dashboard/community`
- `src/app/dashboard/cards`

---

## Suggested Milestone Deliverables

### Milestone A

- Migrations fixed
- Routing execution corrected
- Router management UI live
- Explore page clarified

### Milestone B

- Aquifer schema shipped
- Pocket migration completed
- Aquifer management UI live

### Milestone C

- Subscription aquifer calculator live
- Scheduled payout model working
- Subscription health states visible

### Milestone D

- NGO directory live
- Donation commitments and impact tracking live
- Tax PDF export live

### Milestone E

- Tax Shield live
- Connected spare-change ingestion live

### Milestone F

- Shared aquifers live
- Prize pool live

### Milestone G

- Virtual cards live

---

## Immediate Next Sprint Recommendation

If implementation starts now, the best first sprint is:

1. Write real migrations for `user_transactions`, `spare_bank_transactions`, and `pockets.balance_usdc`.
2. Extract router execution logic out of `src/components/dashboard/DashboardOverview.tsx` into a reusable server/domain flow.
3. Fix multi-router execution and add execution logging.
4. Add router pause, resume, edit, and delete UI.
5. Update misleading UI copy where automation is not yet fully real.

That sprint creates a stable base for the aquifer redesign and prevents new features from compounding existing inconsistencies.
