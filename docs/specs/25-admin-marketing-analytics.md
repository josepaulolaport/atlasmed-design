# Spec: Admin & Marketing Analytics

**Domain:** Admin & Marketing Analytics  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10

> **Implementation status:** Not started. Aggregation layer — all source data models must exist first. Admin analytics can be surfaced in the existing Next.js web app (`apps/web`) using the `/api/v1/analytics/*` endpoints that will be created alongside this spec.  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 13 — Presentation Observability](./13-presentation-observability.md), [Spec 16 — Customer Segmentation Surveys](./16-customer-segmentation-surveys.md), [Spec 17 — Cadastro Health](./17-cadastro-health.md), [Spec 18 — Consent & Communication Management](./18-consent-communication.md)

---

## Overview

Admin and marketing analytics provide strategic visibility across the entire platform — products, presentations, market segments, consent, cadastro health, and customer segmentation coverage. Unlike operational dashboards (representative view) or coaching dashboards (manager view), this module supports cross-segment analysis and is intended for admin users, marketing directors, and medical/regulatory leads.

---

## User Stories

**US-ADM-01 — Product Promotion Analytics**  
As an admin (ADMIN role), I want to see which products are most and least promoted across all territories and segments, so that I can adjust field strategy and training priorities.

**US-ADM-02 — Presentation Analytics**  
As an admin (ADMIN role), I want to see how presentations are being used — completion rates, most skipped slides, average session duration — across all teams, so that I can improve materials.

**US-ADM-03 — Segment Performance Overview**  
As an admin, I want to compare KPIs across market segments, so that I can identify which segment is underperforming.

**US-ADM-04 — Consent Coverage Report**  
As an admin, I want to see consent coverage by channel, segment, and territory, so that I can assess LGPD compliance posture.

**US-ADM-05 — Cadastro Health Overview**  
As an admin, I want to see overall cadastro health across the entire customer base, so that I can drive data quality initiatives.

**US-ADM-06 — Customer Segmentation Coverage**  
As an admin, I want to see what percentage of customers have been segmented, by market segment and by survey version, so that I know how complete the prioritization data is.

---

## Requirements & Acceptance Criteria

### Product Promotion Analytics

**AC-ADM-01**  
WHEN the product promotion analytics view is loaded THEN the system SHALL show: promotion count per product, promotion coverage (% of customers who had each product promoted at least once), interest level distribution, top structured comments per product, and products never promoted in the period.

**AC-ADM-02**  
WHEN filters are applied (segment, territory, specialty, customer classification, date range) THEN all metrics SHALL update accordingly.

---

### Presentation Analytics

**AC-ADM-03**  
WHEN the presentation analytics view is loaded THEN the system SHALL show per presentation: total sessions, completion rate, avg quality score, avg duration, top 5 most skipped slides with skip rates.

**AC-ADM-04**  
WHEN a specific slide is selected THEN the system SHALL show a distribution of time spent on that slide across all sessions.

---

### Segment Performance

**AC-ADM-05**  
WHEN the segment performance view is loaded THEN the system SHALL show per segment: total customers, visited %, behind target %, effective visit rate, product promotion rate, presentation completion rate, cadastro health distribution.

---

### Consent Coverage

**AC-ADM-06**  
WHEN the consent coverage report is loaded THEN the system SHALL show per channel: total customers, with consent %, without consent %, revoked %, filterable by segment and territory.

---

### Cadastro Health Overview

**AC-ADM-07**  
WHEN the cadastro health overview is loaded THEN the system SHALL show: overall health distribution (healthy/incomplete/outdated/critical), breakdown by entity type, top missing fields, trend over time (% healthy this month vs last month).

---

### Filters (all views)

**AC-ADM-08**  
All admin analytics views SHALL support the following filters: market segment, territory, representative, manager, customer type, date range, and customer classification (from Spec 16).

---

### Market Segment Scoping

**AC-ADM-09**  
This spec is accessible to users with the `ADMIN` role only. There is no separate MARKETING role — the platform RBAC has three roles: `ADMIN`, `MANAGER`, and `USER` (see Spec 00 F-007).

ADMIN users see unscoped data by default and MAY filter by segment. ADMIN users with specific segment restrictions (via `UserSegmentAssignment`) see only their assigned segments' data.

> **Web only:** Admin analytics is a web-only feature (`apps/web`). No mobile view is planned for V1.

---

## Design

### Data Export

All analytics views SHALL support CSV export of the underlying data table.

### Open Questions

1. Should marketing users have a dedicated role with read-only access to analytics only?
2. Should presentation slide thumbnails be embedded in the analytics (to show which slides are being skipped)?
3. Is there a scheduled report feature (e.g. weekly email digest of product promotion metrics)?
