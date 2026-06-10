# Atlasmed Architecture

## Overview

Atlasmed will be built as a TypeScript-first platform composed of a backend API, web application, and mobile application. The backend starts as a modular monolith with strong domain boundaries, OpenAPI-first contracts, PostgreSQL as the system of record, Redis for cache and ephemeral workflows, and event-driven patterns for cross-domain side effects.

## System Components

- Backend API: Bun, ElysiaJS, TypeScript, OpenAPI, PostgreSQL, Redis.
- Web app: Next.js, React, TypeScript, Tailwind CSS, dashboard and admin UX.
- Mobile app: Flutter / Dart, targeting Android and iOS. Riverpod for state, GoRouter for navigation, Drift (SQLite) for offline-first local storage. See ADR 0002.
- AI assistant: Permission-aware orchestration layer for retrieval, reasoning, and tool/action execution.
- Notification service: In-app, email, push, calendar reminders, and task alerts.
- Integration layer: SSO, calendar, email, CRM/data imports, and future marketplace integrations.

## Backend Domains

- Identity and access: users, organizations, tenants, roles, permissions, MFA, SSO.
- CRM: clinics, physicians, contacts, notes, relationships, visits.
- Territory: territories, assignments, coverage, routing, geographic metadata.
- Workflow: tasks, follow-ups, reminders, approvals, automation rules.
- Analytics: activity metrics, dashboards, reporting snapshots, usage analytics.
- Notifications: templates, channels, delivery status, user preferences.
- AI assistant: conversations, context retrieval, tool calls, governance, action audit.
- Admin: org management, permission administration, audit logs, system monitoring.

## Data Model Principles

- Every business record belongs to a tenant or has explicit tenant visibility rules.
- Audit-relevant changes record actor, timestamp, source, before/after where appropriate, and reason when provided.
- Healthcare entity data is encrypted at rest and protected by role and territory-level access controls.
- AI-generated suggestions and actions remain distinguishable from user-authored changes.

## API Principles

- OpenAPI-first contracts for backend, web, mobile, and integration consumers.
- Versioned API boundaries for public or partner-facing endpoints.
- Permission checks happen server-side and are never delegated to clients.
- All mutating operations are auditable.

## Event-Driven Patterns

Use domain events for side effects such as notifications, analytics updates, audit enrichment, AI reminders, and integration sync. Keep core transactional decisions inside the owning domain service.

## Deployment Direction

Initial deployments should favor operational simplicity: one backend service, one PostgreSQL database, Redis, web deployment, and mobile app distribution through the Flutter build pipeline (Android APK/AAB, iOS IPA via Xcode Cloud or Fastlane) as requirements mature.
