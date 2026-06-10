# Atlasmed

Atlasmed is an AI-powered healthcare relationship and intelligence platform for pharmaceutical and healthcare commercial teams, clinics, physicians, and partner organizations.

This repository currently contains the AtlasMed static design prototype and product planning documentation. The production system is planned as a backend, web dashboard, and mobile application built through spec-driven development.

## Current Repository Scope

The existing implementation is a static design-frame project for stakeholder review and product discovery. It is not yet the production application.

## Product Vision

Atlasmed connects pharmaceutical representatives, managers, clinics, and physicians through CRM, territory management, healthcare data, workflow automation, analytics, and an AI assistant capable of answering questions and taking actions across the ecosystem.

## Documentation

- `PROJECT_CONTEXT.md` documents the current static design prototype.
- `docs/overview.md` documents the future Atlasmed platform vision.
- `docs/architecture.md` documents the planned backend, web, mobile, data, and AI architecture.
- `docs/security-compliance.md` documents security, privacy, LGPD, audit, and future HIPAA-readiness considerations.
- `docs/features/` contains feature-level documentation.
- `docs/specs/` contains spec-driven development requirements, designs, and task plans.
- `docs/adr/` contains architecture decision records.

## Planned Stack

- **Backend:** TypeScript, Bun, ElysiaJS, PostgreSQL, Redis — modular monolith (ADR 0001).
- **Web:** React, Next.js 16, TypeScript, Tailwind CSS, dashboard-focused design system.
- **Mobile:** Flutter / Dart — Riverpod (state), GoRouter (navigation), Drift (offline-first SQLite), FCM push (ADR 0002).
- **API:** OpenAPI-first design.
- **Architecture:** Modular monolith with clear domain boundaries and event-driven patterns where appropriate.
