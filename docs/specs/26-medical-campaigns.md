# Spec: Medical Promotion Campaigns

**Domain:** Medical Promotion Campaigns  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10

> **Implementation status:** Not started. No `Campaign` model. Requires Spec 10 (segment filter), Spec 12 (product catalog), and Spec 18 (consent check) before campaigns can target customers correctly.  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 16 — Customer Segmentation Surveys](./16-customer-segmentation-surveys.md) (CustomerClassification targeting), [Spec 07 — Presentations](./07-presentations.md), [Spec 13 — Presentation Observability](./13-presentation-observability.md) (campaign presentation tracking), [Spec 18 — Consent & Communication](./18-consent-communication.md), [Spec 28 — Visit Quality Score](./28-visit-quality-score.md) (campaign compliance dimension)

---

## Overview

Medical promotion campaigns are coordinated business initiatives that define which products, customers, market segments, materials, and objectives should be prioritized during a defined period. A campaign connects strategy (what marketing wants) to execution (what representatives do in the field). Campaigns do not replace the general product promotion workflow — they layer prioritization on top of it, influencing what products and materials are surfaced first and allowing marketing to track whether the campaign reached its targets.

> **Scope note:** This spec covers medical promotion campaigns (CLM / detailing / sampling). It does not cover commercial discount campaigns or order pricing promotions.

---

## User Stories

**US-CAM-01 — Representative Sees Active Campaigns**  
As a field representative, I want to see which active campaigns are relevant to the customer I am visiting, so that I know which products and materials to prioritize.

**US-CAM-02 — Campaign Influences Product Ordering**  
As a field representative, I want campaign products to be ranked first during visit product promotion, so that I naturally focus on campaign priorities without extra configuration.

**US-CAM-03 — Manager Monitors Campaign Execution**  
As a manager, I want to see how many campaign-targeted customers have been visited and how many received the campaign presentation, so that I can track field execution of the campaign.

**US-CAM-04 — Admin Creates and Manages Campaigns**  
As an admin (ADMIN role), I want to create campaigns with defined products, target customers, materials, date ranges, and objectives, so that the field team has clear direction.

**US-CAM-05 — Marketing Evaluates Campaign Reach**  
As an admin (ADMIN role), I want to see a post-campaign report on reach, presentation usage, and representative coverage across segments and territories.

---

## Requirements & Acceptance Criteria

### Campaign Management (Admin)

**AC-CAM-01**  
WHEN an admin creates a campaign THEN the system SHALL require: name, date range (start / end), status (draft / active / ended), at least one target product, at least one target market segment, and at least one target customer classification (from Spec 16) OR an explicit "all customers" flag.

**AC-CAM-02**  
WHEN an admin adds products to a campaign THEN the system SHALL optionally allow linking specific CLM materials to each product for that campaign.

**AC-CAM-03**  
WHEN an admin sets target territories THEN only customers in those territories AND with the matching segments AND classification SHALL appear in the campaign target list.

**AC-CAM-04**  
WHEN a campaign status is set to `active` THEN it SHALL become visible in the field app for all representatives whose segments intersect with the campaign's segments.

---

### Representative View

**AC-CAM-05**  
WHEN a representative opens a customer profile or begins a visit THEN the system SHALL display a "Campanhas ativas" section listing all active campaigns relevant to that customer.

**AC-CAM-06**  
WHEN a campaign is displayed THEN the system SHALL show: campaign name, period, target products, and a brief objective statement.

**AC-CAM-07**  
WHEN the representative opens the product selection during visit logging THEN the system SHALL rank campaign products first and display a campaign badge on their cards.

**AC-CAM-08**  
WHEN a campaign requires customer marketing consent (configurable) THEN the system SHALL check consent status (Spec 18) before showing the campaign as applicable to a specific customer.

---

### Campaign Execution Tracking

**AC-CAM-09**  
WHEN a representative promotes a campaign product during a visit THEN the system SHALL automatically link the product promotion record to the active campaign.

**AC-CAM-10**  
WHEN a campaign presentation material is opened during a visit THEN the resulting presentation session (Spec 13) SHALL be linked to the campaign.

---

### Manager Campaign Monitoring

**AC-CAM-11**  
WHEN a manager opens the campaign monitoring view THEN the system SHALL show per campaign: target customer count, customers visited (at least once during campaign period), presentation delivered count, presentation completed %, and segment breakdown.

---

### Market Segment Scoping

**AC-CAM-12**  
All campaign visibility and execution records SHALL apply the two-dimensional authorization rule (Spec 10). A representative only sees campaigns relevant to their assigned segments.

---

## Design

### Data Models

```typescript
type CampaignStatus = 'draft' | 'active' | 'ended' | 'cancelled';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  segmentIds: string[];
  targetTerritoryIds: string[];
  targetClassifications: CustomerClassification[];
  allCustomers: boolean;
  products: CampaignProduct[];
  objective?: string;
  requiresConsent: boolean;
  createdBy: string;
  createdAt: Date;
}

interface CampaignProduct {
  campaignId: string;
  productId: string;
  materialIds: string[];           // optional preferred CLM materials
  priorityOrder: number;
}

interface CampaignExecution {
  campaignId: string;
  visitId: string;
  productPromotionId: string;
  presentationSessionId?: string;
  representativeId: string;
  entityId: string;
  executedAt: Date;
}
```

### Open Questions

1. Can a representative opt out of a campaign for a specific customer (e.g. customer asked not to be approached about that product)?
2. Should campaign performance be visible to representatives, or managers and admins only?
3. Can campaigns overlap on the same product? How is priority determined?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-119](https://linear.app/atlasmed/issue/ATLAS-119/) | Parent | Spec 26: Medical Campaigns | Backlog |
| [ATLAS-120](https://linear.app/atlasmed/issue/ATLAS-120/) | [BE] | Medical Campaigns — campaign model, targeting & launch API | Backlog |
| [ATLAS-121](https://linear.app/atlasmed/issue/ATLAS-121/) | [WE] | Medical Campaigns — admin campaign builder | Backlog |
| [ATLAS-122](https://linear.app/atlasmed/issue/ATLAS-122/) | [MOB] | Medical Campaigns — campaign card in pre-visit briefing | Backlog |
| [ATLAS-184](https://linear.app/atlasmed/issue/ATLAS-184/) | [DESIGN] | Spec 26: Medical Campaigns — admin campaign builder UI | Backlog |
