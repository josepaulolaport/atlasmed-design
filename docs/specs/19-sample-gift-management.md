# Spec: Sample & Gift Management

**Domain:** Sample & Gift Management  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 21 — Requests & Approvals](./21-requests-approvals.md) (replenishment requests), [Spec 28 — Visit Quality Score](./28-visit-quality-score.md) (samples as quality dimension), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. No `SampleItem`, `RepresentativeInventory`, or `SampleDelivery` models. Replenishment requests will use Spec 21 (approval workflow) once implemented. Prerequisite chain: Spec 11 + Spec 12 → **this spec**.

---

## Overview

During visits, field representatives may deliver product samples, promotional gifts, or physical materials to doctors and clinics. This module tracks what was delivered, to whom, in what quantity, and when — linked to the corresponding visit and product promotion record. It also manages each representative's sample inventory balance to prevent over-delivery and supports manager oversight of sample usage across the team.

---

## User Stories

**US-SMP-01 — Register Sample Delivery**  
As a field representative, I want to record which samples or gifts I delivered during a visit, so that the CRM has an accurate delivery record.

**US-SMP-02 — Check My Inventory**  
As a field representative, I want to see my current sample inventory balance, so that I know what I have available before a visit.

**US-SMP-03 — Record No Samples Delivered**  
As a field representative, I want to explicitly mark that no samples were left during a visit, so that the absence of delivery is intentional and not an omission.

**US-SMP-04 — Manager Reviews Sample Usage**  
As a manager, I want to see sample consumption by representative, product, customer, territory, and segment, so that I can monitor compliance and budget.

**US-SMP-05 — Inventory Replenishment**  
As a field representative, I want to request replenishment of my sample inventory, so that I never run out of samples during an active visit period.

---

## Requirements & Acceptance Criteria

### Sample Delivery During Visits

**AC-SMP-01**  
WHEN a representative is logging a visit THEN the system SHALL display a "Amostras e materiais entregues" section within the product promotion form.

**AC-SMP-02**  
WHEN the representative selects a product in the promotion form THEN the system SHALL show the available sample items for that product from the representative's current inventory.

**AC-SMP-03**  
WHEN the representative delivers a sample THEN the system SHALL record: item ID, item name, quantity, recipient (customer), visit ID, product promotion ID, representative ID, delivery date, and market segment.

**AC-SMP-04**  
WHEN the representative explicitly marks "Nenhuma amostra entregue" THEN the system SHALL record a zero-delivery event linked to the visit, making the omission intentional and auditable.

**AC-SMP-05**  
WHEN the representative tries to deliver more units than their current inventory balance THEN the system SHALL display a warning "Saldo insuficiente" and block the delivery unless the business rule allows exceptions (configurable).

---

### Inventory Management

**AC-SMP-06**  
WHEN a delivery is recorded THEN the system SHALL immediately decrement the representative's inventory balance for that item.

**AC-SMP-07**  
WHEN a representative views their inventory THEN the system SHALL display a list of all sample/gift items with current balance, unit type, and last replenished date.

**AC-SMP-08**  
WHEN a representative's balance for an item reaches a configurable low-stock threshold THEN the system SHALL trigger a low-stock notification.

**AC-SMP-09**  
WHEN a representative submits a replenishment request THEN the system SHALL route it through the approval workflow (Spec 21) if configured.

**AC-SMP-10**  
WHEN an admin or manager approves a replenishment THEN the system SHALL credit the representative's inventory balance with the approved quantity and record the transaction.

---

### Compliance Rules

**AC-SMP-11**  
WHEN a sample item is configured with a maximum delivery quantity per customer per period THEN the system SHALL check this limit and warn or block if exceeded.

**AC-SMP-12**  
WHEN a sample item requires customer confirmation or signature THEN the system SHALL require the representative to capture confirmation (checkbox, photo, or digital signature) before saving the delivery.

---

### Manager Reporting

**AC-SMP-13**  
WHEN a manager views the sample usage report THEN the system SHALL show: delivery count, delivered quantity, total units by product, broken down by representative, customer, territory, and market segment.

**AC-SMP-14**  
WHEN a manager views a specific representative's deliveries THEN the system SHALL show a timeline of all deliveries with visit links.

---

### Market Segment Scoping

**AC-SMP-15**  
All sample delivery records and inventory queries SHALL apply the two-dimensional authorization rule (Spec 10). Sample items SHALL be associated with products, which carry segment assignments.

---

## Design

### Data Models

```typescript
interface SampleItem {
  id: string;
  name: string;
  productId?: string;
  unit: string;                  // e.g. "unidade", "caixa", "blister"
  segmentIds: string[];
  maxDeliveryPerCustomerPerPeriod?: number;
  periodDays?: number;
  requiresConfirmation: boolean;
  isActive: boolean;
}

interface RepresentativeInventory {
  representativeId: string;
  itemId: string;
  currentBalance: number;
  lowStockThreshold: number;
  lastReplenishedAt?: Date;
}

interface SampleDelivery {
  id: string;
  visitId: string;
  productPromotionId?: string;
  itemId: string;
  itemName: string;              // snapshot
  quantity: number;
  representativeId: string;
  entityId: string;
  entityType: 'clinic' | 'doctor';
  segmentIds: string[];
  deliveredAt: Date;
  noDelivery: boolean;           // true when explicitly "none delivered"
  confirmationMethod?: 'checkbox' | 'photo' | 'signature';
  confirmationUrl?: string;
}

interface InventoryTransaction {
  id: string;
  representativeId: string;
  itemId: string;
  type: 'delivery' | 'replenishment' | 'adjustment';
  quantity: number;              // negative for delivery, positive for replenishment
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;          // visitId or replenishment request ID
  recordedAt: Date;
  recordedBy: string;
}

interface ReplenishmentRequest {
  id: string;
  representativeId: string;
  itemId: string;
  requestedQuantity: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedQuantity?: number;
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Delivery recorded offline | Saved locally; inventory decremented optimistically; synced with server (Spec 22) |
| Sync conflict (balance inconsistency) | Server balance is source of truth; local pessimistic re-check on sync |
| Item removed from catalog | Historical deliveries retained; item shows as "(Descontinuado)" in history |
| Replenishment denied | Representative notified; balance unchanged |

### Open Questions

1. Are samples and promotional gifts treated as separate item categories with different rules?
2. Is there a monetary value associated with samples for budget tracking?
3. Can a manager manually adjust a representative's inventory balance without a formal replenishment request?
4. Should delivery records be visible to the receiving doctor/clinic in a future portal?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-70](https://linear.app/atlasmed/issue/ATLAS-70/) | Parent | Spec 19: Sample & Inventory Control | Backlog |
| [ATLAS-71](https://linear.app/atlasmed/issue/ATLAS-71/) | [BE] | Sample & Inventory — model, transaction log & low-stock alert | Backlog |
| [ATLAS-72](https://linear.app/atlasmed/issue/ATLAS-72/) | [MOB] | Sample & Inventory — Flutter inventory view & delivery recording | Backlog |
| [ATLAS-161](https://linear.app/atlasmed/issue/ATLAS-161/) | [WE] | Sample & Inventory — manager oversight & replenishment approval | Backlog |
| [ATLAS-175](https://linear.app/atlasmed/issue/ATLAS-175/) | [DESIGN] | Spec 19: Sample & Inventory — manager oversight UI | Backlog |
