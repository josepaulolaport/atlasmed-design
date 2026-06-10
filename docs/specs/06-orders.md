# Spec: Orders (Pedidos)

**Domain:** Orders  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Orders module (all screens) | ❌ **Not started** | No Order or Product model in codebase |
| **Prerequisites** | — | Spec 12 (Product model) → Spec 10 → this spec |

> This spec is a **mobile-only** feature. No order-related API endpoints or data models exist in the current codebase.

---

## Overview

The Orders module allows field representatives to create, review, and track product orders on behalf of their clinic and doctor contacts. The flow covers browsing the product catalog, building a cart, checking out with a clinic/doctor destination, receiving order confirmation, and tracking live delivery status. Representatives can also view their order history filtered by status, repeat past orders, and contact support for help with a specific order.

---

## User Stories

**US-ORD-01 — View Order History**  
As a field representative, I want to see a list of my orders organized by status, so that I can quickly check what is pending, in transit, or delivered.

**US-ORD-02 — Create a New Order**  
As a field representative, I want to browse the product catalog, add items to a cart, set a destination clinic and doctor, and submit an order, so that I can place orders on behalf of my clients during or after a visit.

**US-ORD-03 — Negotiate Price**  
As a field representative, I want to enter a negotiated price for each product that differs from the catalog price, and see the savings vs. catalog at checkout, so that I can reflect agreed-upon terms.

**US-ORD-04 — Track Order Delivery**  
As a field representative, I want to see the real-time status and location of an order in transit, so that I can keep my client informed.

**US-ORD-05 — Repeat an Order**  
As a field representative, I want to repeat a previous order in one tap, so that I can save time for recurring clients.

**US-ORD-06 — Cancel an Order**  
As a field representative, I want to cancel an order that has not yet shipped, so that I can correct mistakes or honor a client's change of mind.

**US-ORD-07 — Contact Support for an Order**  
As a field representative, I want to reach order support directly from an order detail, so that I can resolve delivery issues quickly.

---

## Requirements & Acceptance Criteria

### Order List

**AC-ORD-01**  
WHEN the user opens Pedidos THEN the system SHALL display a summary strip (Em trânsito / Pendentes / Entregues counts) and a list of all orders for the representative.

**AC-ORD-02**  
WHEN the user selects a filter chip (Todos / Em trânsito / Pendente / Entregue / Cancelado) THEN the system SHALL filter the list to show only orders of that status.

**AC-ORD-03**  
WHEN an order card is displayed THEN the system SHALL show: order ID, date, clinic name, doctor name, status chip, item count, and total value (R$).

**AC-ORD-04**  
WHEN the list is empty THEN the system SHALL display an empty state with a "Criar primeiro pedido" CTA.

**AC-ORD-05**  
WHEN the user taps "Novo pedido" THEN the system SHALL navigate to the product selection screen.

---

### Order Detail

**AC-ORD-06**  
WHEN the user taps an order card THEN the system SHALL navigate to the order detail screen.

**AC-ORD-07**  
WHEN the order detail loads THEN the system SHALL display: order ID, status chip, delivery timeline (Pedido confirmado → Em separação → Em trânsito → Entregue), destination (clinic address and doctor), item list with unit price × quantity, payment details (method, NF-e number, subtotal, freight, total), and delivery estimate.

**AC-ORD-08**  
WHEN the order status is "Em trânsito" THEN the system SHALL display a tracking code with a copy-to-clipboard button.

**AC-ORD-09**  
WHEN the user taps "Repetir pedido" THEN the system SHALL create a new cart pre-filled with the same items and destination as the current order and navigate to the cart screen.

**AC-ORD-10**  
WHEN the user taps "Suporte" THEN the system SHALL navigate to the support contact screen (phone / email / chat) with the current order ID pre-filled.

---

### New Order — Product Selection

**AC-ORD-11**  
WHEN the product selection screen opens THEN the system SHALL display a clinic context strip (showing the pre-selected clinic or "Selecionar clínica") with a "Trocar" action, a search bar, category filter chips, and a product grid/list.

**AC-ORD-12**  
WHEN a product card is displayed THEN the system SHALL show: name, subtitle, catalog price, product tags (Top / Novo / Premium), a purchase-history badge if the clinic has ordered it before, and the current cart quantity.

**AC-ORD-13**  
WHEN the user taps a product card THEN the system SHALL open the Product Order Sheet showing: product name, quantity stepper (+/−), and a negotiated price field pre-filled with the catalog price.

**AC-ORD-14**  
WHEN the user taps "Adicionar" in the Product Order Sheet THEN the system SHALL add or update the item in the cart and close the sheet.

**AC-ORD-15**  
WHEN the cart contains at least one item THEN the system SHALL display a floating "Ver carrinho (N)" button at the bottom of the product screen.

**AC-ORD-16**  
WHEN the user filters by category chip THEN the system SHALL filter the product list to that category.

**AC-ORD-17**  
WHEN the user searches THEN the system SHALL filter products in real time by name or subtitle.

---

### Cart

**AC-ORD-18**  
WHEN the cart screen opens THEN the system SHALL display all line items with name, unit price, and a quantity stepper (+/−).

**AC-ORD-19**  
WHEN a quantity stepper reaches 0 THEN the system SHALL remove the item from the cart.

**AC-ORD-20**  
WHEN the cart is displayed THEN the system SHALL show a running subtotal and a "Finalizar pedido" CTA.

**AC-ORD-21**  
WHEN the cart is empty THEN the system SHALL display an empty-cart state with a "Adicionar produtos" CTA.

---

### Checkout

**AC-ORD-22**  
WHEN the checkout screen loads THEN the system SHALL display a step indicator (Produtos → Carrinho → Checkout), a clinic selector, a doctor selector, and an order summary.

**AC-ORD-23**  
WHEN no clinic is selected THEN the system SHALL disable the doctor selector and the "Confirmar pedido" button.

**AC-ORD-24**  
WHEN the user taps the clinic selector THEN the system SHALL open the `ClinicSelectorSheet`.

**AC-ORD-25**  
WHEN a clinic is selected THEN the system SHALL enable the doctor selector.

**AC-ORD-26**  
WHEN the user taps the doctor selector THEN the system SHALL open the `DoctorSelectorSheet` filtered to doctors at the selected clinic.

**AC-ORD-27**  
WHEN both clinic and doctor are selected THEN the system SHALL display a delivery estimate based on the clinic's address and enable the "Confirmar pedido" button.

**AC-ORD-28**  
WHEN the order summary is displayed THEN the system SHALL show: negotiated price per item, catalog price per item, and total savings vs. catalog.

**AC-ORD-29**  
WHEN the user taps "Confirmar pedido" THEN the system SHALL submit the order and navigate to the success screen on acceptance.

---

### Clinic Selector Sheet

**AC-ORD-30**  
WHEN the `ClinicSelectorSheet` opens THEN the system SHALL display tabs (Recentes / Todas), a search bar, and a list of clinics.

**AC-ORD-31**  
WHEN the Recentes tab is active THEN clinics SHALL be sorted by most recent order date.

**AC-ORD-32**  
WHEN the Todas tab is active THEN clinics SHALL be sorted by distance.

**AC-ORD-33**  
WHEN a clinic row is displayed THEN the system SHALL show: monogram, name, address, status pill, last order date (Recentes tab), and distance.

**AC-ORD-34**  
WHEN the user selects a clinic THEN the system SHALL close the sheet and update the checkout destination.

---

### Doctor Selector Sheet

**AC-ORD-35**  
WHEN the `DoctorSelectorSheet` opens THEN the system SHALL show a search bar and a list filtered to doctors at the selected clinic.

**AC-ORD-36**  
WHEN a doctor row is displayed THEN the system SHALL show: avatar, name, role badge (Decisora / Influenciadora / Decisor), specialty, and CRM.

**AC-ORD-37**  
WHEN the selected clinic has no registered doctors THEN the system SHALL display an empty state with an "Adicionar médico" CTA.

---

### Order Success

**AC-ORD-38**  
WHEN the order is confirmed THEN the system SHALL display a success screen with: success hero animation, generated order ID, destination, item summary, total, delivery estimate, and a "Ver meus pedidos" button.

---

### Order Live Tracking

**AC-ORD-39**  
WHEN the user opens an in-transit order THEN the system SHALL display a status hero gradient, delivery estimate date, a 4-step timeline with timestamps, a product list, total, payment method, and delivery address.

**AC-ORD-40**  
WHEN the order status is "Saiu para entrega" (out for delivery) THEN the system SHALL display a driver card with: driver name, vehicle, star rating, ETA, and action buttons Mensagem / Ligar.

**AC-ORD-41**  
WHEN the user taps "Cancelar pedido" THEN the system SHALL display a confirmation dialog before cancelling.

**AC-ORD-42**  
IF the order status is "Entregue" or "Em trânsito (shipped)" THEN the system SHALL disable the "Cancelar pedido" button.

**AC-ORD-43**  
WHEN the user taps the refresh button THEN the system SHALL fetch the latest order status.

---

## Design

### Screen Flow

```
OrderListScreen
  ├── [tap order] → OrderDetailScreen
  │                    └── OrderTrackingScreen (live tracking)
  └── [Novo pedido] → ProductSelectionScreen
                          └── [Ver carrinho] → CartScreen
                                                  └── CheckoutScreen
                                                        └── OrderSuccessScreen
```

### Data Models

```typescript
type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface Order {
  id: string;
  createdAt: Date;
  status: OrderStatus;
  clinicId: string;
  clinicName: string;
  clinicAddress: Address;
  doctorId: string;
  doctorName: string;
  doctorCrm: string;
  items: OrderItem[];
  subtotal: number;
  freight: number;
  total: number;
  paymentMethod: string;
  nfeNumber?: string;
  estimatedDelivery?: Date;
  trackingCode?: string;
  driver?: Driver;
  timeline: OrderStatusEvent[];
}

interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  catalogPrice: number;
  negotiatedPrice: number;
}

/**
 * OrderStatusEvent — delivery status history for an order.
 * Renamed from TimelineEvent to avoid collision with CustomerTimelineEvent (Spec 27).
 */
interface OrderStatusEvent {
  status: OrderStatus;
  occurredAt: Date;
  description: string;
}

interface Driver {
  name: string;
  vehicle: string;
  rating: number;
  etaMinutes: number;
  phone: string;
}

interface CartItem {
  productId: string;
  productName: string;
  catalogPrice: number;
  negotiatedPrice: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  clinicId?: string;
  doctorId?: string;
}

/**
 * Product catalog for orders.
 * The canonical Product entity is defined in Spec 12 (Product Promotion).
 * This interface extends it with order-specific fields.
 * Spec 12 owns the base Product model (therapeuticArea, segments, status, etc.)
 * Orders add: catalogPrice, stockStatus, tags, hasPurchaseHistory.
 * These are sourced from a separate catalog/pricing service or added to the
 * Product model in Spec 12 when Orders is implemented.
 */
interface OrderCatalogProduct {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  catalogPrice: number;
  tags: ('Top' | 'Novo' | 'Premium')[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  hasPurchaseHistory: boolean;
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Order submission fails | Toast error with retry; cart preserved |
| Product out of stock | Disable add-to-cart; show "Sem estoque" badge |
| Clinic address missing (no delivery estimate) | "Endereço não cadastrado" placeholder |
| Doctor not linked to clinic | Empty doctor sheet with add-doctor CTA |
| Order already cancelled | Disable cancel button; show "Pedido já cancelado" |
| Network loss during checkout | Show "Sem conexão" banner; preserve cart state |
| Tracking API unavailable | "Rastreamento temporariamente indisponível" with last known status |

### Market Segmentation Note

The product catalog shown during order creation SHALL apply the two-dimensional authorization rule (Spec 10, AC-SEG-16): only products whose segments intersect with both the representative's assigned segments AND the destination clinic's segments are displayed. The clinic/doctor selection lists in the checkout flow are also scoped to the user's territory and segment scope.

### Open Questions

1. ~~Is order creation a real-time API call or does it go into a pending queue when offline?~~ **Resolved:** Order registration requires connectivity (Spec 22 AC-OFF-02). The order form is unavailable offline; a "Sem conexão" banner is shown. Orders are NOT queued offline because they require live inventory/price validation.
2. What is the maximum number of distinct items per order?
3. Are negotiated prices validated server-side (e.g. must be within X% of catalog)?
4. Is cancellation only allowed before "Em separação" (processing) or also after?
5. Should the new-order flow be accessible from within a clinic/doctor detail screen?
6. Are orders tied to a specific contract or price table per clinic?
