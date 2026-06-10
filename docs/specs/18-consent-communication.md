# Spec: Consent & Communication Management

**Domain:** Marketing Opt-In · Consent Management · Communication Preferences  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 04 — Client Management](./04-client-management.md), [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. No `ConsentRecord` or `CommunicationPreferences` models. Attaches to existing `Clinic`/`Doctor` records (F-013/F-014). The `AuditLog` system (F-010) can be leveraged for consent event immutability. LGPD compliance requires this before any outbound communication features (notifications, WhatsApp) go to production.

---

## Overview

Consent management ensures that the Atlasmed CRM complies with LGPD (Lei Geral de Proteção de Dados) and any applicable regulations governing outbound communication with healthcare professionals. Before contacting a doctor or clinic through any channel — WhatsApp, email, phone, SMS, or social media — the system must have a valid, auditable consent record for that channel and purpose. Communication preferences are stored separately: consent answers whether contact is *allowed*; preferences answer how the customer *prefers* to be contacted.

---

## User Stories

**US-CON-01 — Capture Consent**  
As a field representative, I want to record a doctor's or clinic's consent for each communication channel during a visit, so that the system knows which channels are authorized.

**US-CON-02 — View Consent Status**  
As a field representative, I want to see at a glance which channels a customer has consented to, so that I contact them only through approved channels.

**US-CON-03 — Revoke Consent**  
As a field representative, I want to record a consent revocation when a customer requests it, so that the system immediately reflects their withdrawal.

**US-CON-04 — Audit Consent History**  
As a manager or admin, I want to see the full consent history for any customer (who captured it, when, which policy version), so that we have an auditable LGPD compliance record.

**US-CON-05 — Set Communication Preferences**  
As a field representative, I want to record a customer's preferred contact channel, time window, and contact person, so that follow-ups respect their preferences.

**US-CON-06 — Monitor Consent Coverage**  
As a manager, I want to see which customers in my territory and segment have no consent records for key channels, so that I can assign my team to collect consent during visits.

---

## Requirements & Acceptance Criteria

### Consent Records

**AC-CON-01**  
WHEN a consent record is created THEN the system SHALL require: customer reference, channel, purpose, consent status (granted/revoked), capture method, policy version, and the representative who captured it.

**AC-CON-02**  
WHEN a consent is granted THEN the system SHALL record: `grantedAt`, `grantedBy`, `policyVersionId`, `captureMethod` (verbal/written/digital), and optional `evidenceUrl` (photo of signature, etc.).

**AC-CON-03**  
WHEN a consent is revoked THEN the system SHALL record: `revokedAt`, `revokedBy`, `revocationReason`, and a note. The original grant record SHALL NOT be deleted; the revocation is a new event in the history.

**AC-CON-04**  
WHEN a consent record exists for a channel THEN the most recent event (grant or revocation) defines the current status. The system SHALL not allow creating a new grant on a channel that already has an active grant without first registering a revocation.

---

### Consent Channels and Purposes

**Channels (admin-configurable):** WhatsApp, E-mail, Telefone, SMS, Instagram, LinkedIn, Facebook.

**Purposes:**
- `operational` — contact for visit scheduling, follow-ups, order updates
- `marketing` — contact for campaigns, new product announcements, promotional material

**AC-CON-05**  
WHEN the consent form is displayed THEN the system SHALL show each channel with purpose toggles and allow the representative to record grants or revocations per channel/purpose combination.

**AC-CON-06**  
WHEN a quick action (e.g. WhatsApp, Ligar) is tapped from a customer profile THEN the system SHALL check for active consent on that channel for the `operational` purpose. If consent is absent or revoked, the system SHALL display a warning: "Sem consentimento registrado para este canal."

**AC-CON-07**  
WHEN consent for marketing campaigns is absent for a customer THEN the system SHALL exclude them from future campaign targeting (Spec 26 — Medical Promotion Campaigns).

---

### Communication Preferences

**AC-CON-08**  
WHEN communication preferences are created THEN the system SHALL allow recording: preferred channel, preferred time window, preferred contact person (name and role), language preference, and a notes field.

**AC-CON-09**  
WHEN preferences are displayed on a customer profile THEN the system SHALL show them in a dedicated "Preferências de contato" section below the consent section.

**AC-CON-10**  
WHEN a preferred channel is set THEN the system SHALL NOT treat it as consent for that channel. Consent and preference are independent records.

---

### Display on Customer Profile

**AC-CON-11**  
WHEN the customer profile is displayed THEN the consent status SHALL be visible in the pre-visit intelligence view (Spec 14) and the administrative section of the profile.

**AC-CON-12**  
WHEN a channel has active consent THEN the system SHALL display a green ✓ badge. When revoked or never collected, a grey or red indicator SHALL be shown.

---

### Consent Coverage Report

**AC-CON-13**  
WHEN a manager opens the consent coverage report THEN the system SHALL show: total customers, customers with full consent, customers with partial consent, customers with no consent — filterable by channel, representative, territory, and market segment.

---

### Market Segment Scoping

**AC-CON-14**  
All consent records and preference queries SHALL apply the two-dimensional authorization rule (Spec 10). Consent is tied to the customer; access follows normal segment + territory scoping.

---

## Design

### Data Models

```typescript
type ConsentChannel =
  | 'whatsapp' | 'email' | 'phone' | 'sms'
  | 'instagram' | 'linkedin' | 'facebook';

type ConsentPurpose = 'operational' | 'marketing';
type ConsentCaptureMethod = 'verbal' | 'written' | 'digital';
type ConsentEventType = 'granted' | 'revoked';

interface ConsentRecord {
  id: string;
  entityId: string;
  entityType: 'clinic' | 'doctor';
  channel: ConsentChannel;
  purpose: ConsentPurpose;
  eventType: ConsentEventType;
  capturedBy: string;
  capturedAt: Date;
  captureMethod?: ConsentCaptureMethod;
  policyVersionId: string;
  evidenceUrl?: string;
  revocationReason?: string;
  note?: string;
}

interface ConsentStatus {
  entityId: string;
  channels: {
    channel: ConsentChannel;
    purpose: ConsentPurpose;
    status: 'granted' | 'revoked' | 'not_collected';
    lastEventAt?: Date;
    capturedBy?: string;
  }[];
}

interface CommunicationPreferences {
  entityId: string;
  preferredChannel?: ConsentChannel;
  preferredTimeWindow?: string;        // e.g. "Tardes após 14h"
  preferredContactPerson?: string;
  preferredContactRole?: string;       // e.g. "Secretária"
  language?: string;
  notes?: string;
  updatedBy: string;
  updatedAt: Date;
}

interface ConsentPolicyVersion {
  id: string;
  version: string;
  text: string;
  effectiveDate: Date;
  isActive: boolean;
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Consent captured offline | Saved locally; synced when reconnected (Spec 22) with original timestamp |
| Policy version not found | Default to latest active version; log a warning |
| Duplicate grant for same channel/purpose | System warns "Consentimento já registrado para este canal" and shows existing record |
| Quick action blocked by missing consent | Warning shown; representative can still proceed after explicit acknowledgment (not blocked) |

### Open Questions

1. Should the consent policy text be stored in the database or linked to an external legal document?
2. Is there an expiry on consent grants (e.g. LGPD right to be forgotten after X years)?
3. Should WhatsApp consent include a specific WABA template opt-in for WhatsApp Business API?
4. Can a representative capture consent on behalf of a doctor who is not physically present (e.g. over the phone)?
5. Does consent data need to be exported for LGPD data subject access requests (DSAR)?
