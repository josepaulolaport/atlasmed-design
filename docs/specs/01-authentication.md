# Spec: Authentication

**Domain:** Authentication  
**Status:** Web: Implemented · Mobile: Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 10 — Market Segmentation](./10-market-segmentation.md) (session token carries segment context), [Spec 02 — App Shell](./02-app-shell-navigation.md), [Spec 32 — Mobile Architecture](./32-mobile-architecture.md) (`flutter_secure_storage` for tokens, `dio` auth interceptor), [Spec 00 — Platform Foundation](./00-platform-foundation.md) (F-002 / existing auth system)

## Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Web authentication (JWT, 2FA, sessions) | ✅ **Implemented** | See F-002 in Spec 00 — full JWT + TOTP + refresh rotation |
| Password reset & change | ✅ **Implemented** | F-004 |
| Profile & verification | ✅ **Implemented** | F-005 |
| Session management (web) | ✅ **Implemented** | Device tracking, revocation |
| Invitation-based registration | ✅ **Implemented** | F-003 |
| Mobile authentication (Flutter) | ❌ **Not started** | Builds on existing `/api/v1/access` endpoints; Flutter stub exists (F-019) |
| Splash screen / onboarding flow | ❌ **Not started** | Mobile only |
| SSO/OIDC (Google, Entra, Okta) | ❌ **Not started** | F-109 |
| 2FA recovery codes | ❌ **Not started** | Planned gap |
| Multi-org login flow (org switcher) | ❌ **Not started** | Depends on Spec 00-multi-tenancy |

> **Context for this spec:** The user stories and mobile-facing screens in this spec describe the **Flutter mobile app** (Spec 32). The underlying API endpoints (`/api/v1/access/*`) are already implemented and production-grade. Mobile implementation uses `dio` for API calls and `flutter_secure_storage` for token storage (see Spec 32).

---

## Overview

Authentication covers every screen and flow a user encounters before gaining access to the app's main workspace. This includes the animated splash screen, email/password login, error handling for bad credentials and locked accounts, a three-step "forgot password" recovery flow, and the post-login success transition. The system targets pharmaceutical field representatives (representantes comerciais) who log in via a managed identity provided by their organization.

---

## User Stories

**US-AUTH-01 — Login**  
As a field representative, I want to sign in with my email and password, so that I can access my personalized workspace.

**US-AUTH-02 — Password Recovery**  
As a field representative who has forgotten my password, I want to reset it via email verification, so that I can regain access to my account without contacting support.

**US-AUTH-03 — Credential Error Feedback**  
As a field representative, I want clear error messages when my credentials are incorrect or my account is locked, so that I understand what happened and know what to do next.

**US-AUTH-04 — Session Persistence**  
As a field representative using the app daily, I want my session to persist between app opens (configurable), so that I do not need to sign in on every launch.

**US-AUTH-05 — Splash Screen**  
As a field representative opening the app, I want to see the AtlasMed brand while the app initializes, so that the startup feels intentional and polished.

---

## Requirements & Acceptance Criteria

### Splash Screen

**AC-AUTH-01**  
WHEN the app is launched THEN the system SHALL display the AtlasMed animated logo with a loading indicator for a minimum of 1.5 seconds before advancing.

**AC-AUTH-02**  
WHEN the app has completed initialization THEN the system SHALL automatically advance from the splash screen to the login screen without requiring user interaction.

---

### Login

**AC-AUTH-03**  
WHEN the user views the login screen THEN the system SHALL display an email input field, a password input field with show/hide toggle, a "Entrar" submit button, a "Esqueci minha senha" link, and a terms footer.

**AC-AUTH-04**  
WHEN the user submits valid credentials THEN the system SHALL display the login-success screen showing the user's first name and a workspace loading message.

**AC-AUTH-05**  
WHEN the user submits an incorrect email or password THEN the system SHALL display an inline error message, apply a shake animation to the form, and keep the user on the login screen.

**AC-AUTH-06**  
WHEN the user's account has been locked (too many failed attempts) THEN the system SHALL display a "conta bloqueada" error message and disable the submit button until the lockout period expires or the user resets their password.

**AC-AUTH-07**  
WHEN a network error occurs during login THEN the system SHALL display a "sem conexão" error message and allow the user to retry.

**AC-AUTH-08**  
WHEN the user taps the show/hide password toggle THEN the system SHALL toggle the password field between masked (•••) and plain-text display.

**AC-AUTH-09**  
WHEN the "Entrar" button is tapped and the request is in flight THEN the system SHALL display a loading spinner inside the button and disable all form inputs to prevent duplicate submissions.

---

### Forgot Password — Step 1 (Email)

**AC-AUTH-10**  
WHEN the user taps "Esqueci minha senha" THEN the system SHALL navigate to the forgot-password email screen showing a step indicator (1 of 3).

**AC-AUTH-11**  
WHEN the user submits a valid email address THEN the system SHALL send a 6-digit verification code to that email and advance to step 2.

**AC-AUTH-12**  
WHEN the user submits an email address that is not registered THEN the system SHALL display an error message and remain on step 1.

**AC-AUTH-13**  
WHEN the user taps "Voltar" on the forgot-password flow THEN the system SHALL return to the login screen.

---

### Forgot Password — Step 2 (Verification Code)

**AC-AUTH-14**  
WHEN the user is on step 2 THEN the system SHALL display a 6-digit code input, a 42-second resend cooldown timer, and a step indicator (2 of 3).

**AC-AUTH-15**  
WHEN the user enters the correct 6-digit code THEN the system SHALL advance to step 3.

**AC-AUTH-16**  
WHEN the user enters an incorrect code THEN the system SHALL display an "código inválido" error and allow the user to try again.

**AC-AUTH-17**  
WHEN the 42-second cooldown elapses THEN the system SHALL enable a "Reenviar código" action.

**AC-AUTH-18**  
WHEN the user requests a resend THEN the system SHALL send a new code, reset the 42-second timer, and disable the resend action again.

---

### Forgot Password — Step 3 (New Password)

**AC-AUTH-19**  
WHEN the user is on step 3 THEN the system SHALL display a new-password input, a confirm-password input, and a real-time strength checklist covering: minimum 8 characters, at least one number, at least one uppercase letter, and both fields matching.

**AC-AUTH-20**  
WHEN all checklist items are satisfied THEN the system SHALL enable the "Redefinir senha" submit button.

**AC-AUTH-21**  
WHEN the user submits a valid new password THEN the system SHALL update the password, display a success screen, and auto-redirect to the login screen after 3 seconds.

**AC-AUTH-22**  
WHEN the user taps "Voltar ao login" on the success screen THEN the system SHALL navigate immediately to the login screen.

---

### Session Persistence

**AC-AUTH-23**  
WHEN a user has successfully authenticated THEN the system SHALL store a secure session token that persists across app restarts.

**AC-AUTH-24**  
WHEN a valid session token exists on app launch THEN the system SHALL skip the login screen and advance directly to the main workspace (post-login success).

**AC-AUTH-25**  
WHEN a session token has expired THEN the system SHALL clear the token and redirect the user to the login screen.

---

## Design

### Screen Inventory

| Screen | Route / State | Entry |
|--------|--------------|-------|
| Splash | `auth/splash` | App launch |
| Login | `auth/login` | Auto (no session) |
| Login Success | `auth/login-success` | Valid credentials |
| Forgot — Email | `auth/forgot/email` | "Esqueci minha senha" |
| Forgot — Code | `auth/forgot/code` | Email submitted |
| Forgot — New Password | `auth/forgot/new-password` | Code validated |
| Forgot — Success | `auth/forgot/success` | Password updated |

### Navigation Flow

```
App Launch
  └── [no valid session] → Splash → Login
        ├── [valid creds] → Login Success → Main Workspace
        ├── [wrong creds] → Login (error state)
        ├── [locked] → Login (locked state)
        └── [forgot] → Forgot/Email → Forgot/Code → Forgot/NewPwd → Forgot/Success → Login
```

### Component Architecture

- **`SplashScreen`** — animated logo (`AtlasMark` SVG arc), dot loader, auto-advance timer
- **`LoginScreen`** — form container, `GlassInput` for email/password, `PrimaryButton`, error toast, terms footer
- **`ForgotEmailScreen`** — email input, step indicator, back button
- **`ForgotCodeScreen`** — 6-digit OTP input (segmented or single), resend timer, back button
- **`ForgotNewPasswordScreen`** — password inputs, live strength checklist, submit button
- **`ForgotSuccessScreen`** — success animation, auto-redirect timer, manual back-to-login link
- **`LoginSuccessScreen`** — personalized greeting, workspace loading indicator

### Data Models

```typescript
interface LoginRequest {
  email: string;       // validated email format
  password: string;    // min 1 char (server validates complexity)
}

interface AuthSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userDisplayName: string;
}

interface PasswordResetFlow {
  email: string;
  verificationCode: string;    // 6-digit OTP
  newPassword: string;
  confirmPassword: string;
}
```

### Error States

| Trigger | UI Response |
|---------|-------------|
| Wrong credentials | Inline error banner + shake animation |
| Account locked | Inline error, submit disabled |
| Network failure | Toast with retry action |
| Expired session | Silent redirect to login |
| Invalid OTP | Inline error, input cleared |
| Expired OTP | Prompt to resend |
| Passwords don't match | Checklist item turns red, submit disabled |

### Security Considerations

- Passwords are never stored on device; only opaque tokens are persisted.
- Session tokens must be stored in the platform's secure enclave (Keychain on iOS, Keystore on Android).
- Failed login attempts must be rate-limited server-side (lockout policy is a backend concern).
- The verification code must expire server-side (recommended TTL: 10 minutes).
- All auth requests must use HTTPS/TLS 1.2+.

### Market Segmentation Note

When a user's session token is issued after successful login, it SHALL include the user's current `segmentIds` and `territoryIds` as part of the authentication context (see [Spec 10 — Market Segmentation](./10-market-segmentation.md), `AuthContext`). These are used by every downstream scoped query. If segment or territory assignments change while the user is logged in, the session token must be refreshed to reflect the updated scope.

### Open Questions

1. What is the lockout threshold (number of failed attempts) and duration?
2. Should "Remember me" be an explicit toggle or always-on for mobile?
3. Is biometric authentication (Face ID / fingerprint) in scope for MVP?
4. What is the OTP expiry window?
5. Does password reset require the user to be logged out first, or can authenticated users also access it?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-124](https://linear.app/atlasmed/issue/ATLAS-124/) | Parent | Spec 01: Authentication (Flutter mobile) | Backlog |
| [ATLAS-125](https://linear.app/atlasmed/issue/ATLAS-125/) | [MOB] | Authentication — Flutter auth screens & session flow | Backlog |
| [ATLAS-126](https://linear.app/atlasmed/issue/ATLAS-126/) | [BE] | Authentication — 2FA recovery codes | Backlog |
| [ATLAS-150](https://linear.app/atlasmed/issue/ATLAS-150/) | [BE] | Authentication — API fully implemented (backend complete) | Done |
