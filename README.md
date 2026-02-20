# Okta Demo Platform

A visual companion app for Okta SE demos — connects to your Okta tenant and provides real-time visualization of users, applications, MFA policies, and system logs mapped to the **UD → SSO → LCM → AMFA** demo flow.

![Demo Flow](https://img.shields.io/badge/Okta-UD%20%7C%20SSO%20%7C%20LCM%20%7C%20AMFA-0052FF?style=for-the-badge)

## Features

### 📊 Dashboard Overview
- Aggregate stats: total users, apps, policies, groups
- User source breakdown (AD, HR, CSV, Okta-mastered) with visual bar chart
- Application integration type distribution (SAML, OIDC, SWA, WS-Fed)

### 👤 Users View (Universal Directory)
- Every user displayed with their **provisioning source** auto-detected:
  - 🏢 **Active Directory** — delegated auth / AD-mastered
  - 👥 **HR System** — imported from Workday/BambooHR/CSV with employee attributes
  - 📄 **CSV Import** — bulk-imported users
  - ☁️ **Okta Cloud** — created directly in Okta
  - 🌐 **Federated IdP** — social or external identity providers
- Filter by source type, search by name/email
- Expandable cards with profile details and last login

### 🔑 Applications View (SSO)
- All applications with their **integration type** visually tagged:
  - 🔐 SAML 2.0
  - 🔑 OIDC / OAuth 2.0
  - 🔒 SWA (Password Vault)
  - 🏛️ WS-Federation
  - 🔗 Bookmark
- SCIM provisioning status indicator
- Filter by protocol type

### 🛡️ MFA & Auth Policies View
- Grouped by policy type: Global Session, MFA Enrollment, Authentication (Access)
- Each policy expandable to show **rules** with:
  - Conditions summarized (network, groups, risk level, platform)
  - Actions summarized (MFA required, factor prompt mode, session config)
  - Raw JSON toggle for deep inspection
- Available **authenticators** listed with status

### 📋 System Logs (Live)
- **Real-time polling** (configurable interval, default 10s)
- Every log event automatically **categorized** into demo phases:
  - 🔵 **UD** — user.lifecycle.*, directory.* events
  - 🟢 **SSO** — user.authentication.sso, app.auth.sso events
  - 🟠 **LCM** — application.provision.*, group.user_membership.* events
  - 🟣 **AMFA** — user.mfa.*, policy.evaluate_sign_on, security.threat.* events
- **Phase activity bar** showing distribution of events across demo phases
- Time range filter (15m, 1h, 6h, 24h)
- Phase filter (UD, SSO, LCM, AMFA)
- Expandable log entries with client info (IP, location, user agent)

### ▶ Demo Flow (Interactive Walkthrough)
- Step-by-step guide through the full **UD → SSO → LCM → AMFA** demo
- Each step includes:
  - Scenario description with persona
  - **Actionable checklist** (what to click/show)
  - **Talking points** for the customer conversation
  - **Live log panel** filtered to the current demo phase
- Start/Stop demo mode enables live log polling

---

## Quick Start

### Prerequisites
- Node.js 18+
- An Okta tenant (dev or preview org works perfectly)
- An API token with read permissions

### 1. Clone and Install

```bash
git clone https://github.com/your-username/okta-demo-platform.git
cd okta-demo-platform
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Okta tenant details:

```
VITE_OKTA_ORG_URL=https://your-org.oktapreview.com
VITE_OKTA_API_TOKEN=00abc123...
```

**Creating an API Token:**
1. Log into your Okta admin console
2. Navigate to **Security → API → Tokens**
3. Click **Create Token**, give it a name like "Demo Platform"
4. Copy the token value (you won't see it again)

The token inherits the permissions of the admin who creates it. For this platform, you need read access to users, apps, logs, policies, and groups.

### 3. Start the Proxy Server

For security, API calls are proxied through a local server so your token stays server-side:

```bash
node server/proxy.js
```

### 4. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Demo Scenario

The platform is built around a single persona-driven story:

> **Sarah Chen** is a new Project Manager at Acme Corp.

| Step | Product | What Happens |
|------|---------|-------------|
| 1 | **UD** | Sarah's AD credentials trigger JIT provisioning into Okta Universal Directory |
| 2 | **SSO** | Sarah clicks O365 in her Okta dashboard → seamless SAML federation |
| 3 | **LCM** | Sarah is added to "CRM-Migration-Team" group → Salesforce auto-provisioned via SCIM |
| 4 | **AMFA** | Sarah accesses Salesforce from a hotel WiFi → risk score spikes → MFA challenge |

---

## Project Structure

```
okta-demo-platform/
├── server/
│   └── proxy.js              # Express proxy for Okta API calls
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── ConnectionBanner.jsx # Okta connection status
│   │   ├── OverviewDashboard.jsx# Aggregate dashboard
│   │   ├── UsersView.jsx        # Users with source detection
│   │   ├── ApplicationsView.jsx # Apps with integration types
│   │   ├── PoliciesView.jsx     # MFA & auth policies
│   │   ├── SystemLogsView.jsx   # Real-time log viewer
│   │   └── DemoFlowView.jsx     # Interactive demo walkthrough
│   ├── hooks/
│   │   └── useOktaData.js       # React hooks for data fetching
│   ├── services/
│   │   └── oktaApi.js           # Okta API service layer
│   ├── styles/
│   │   └── index.css            # Global styles
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Okta API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/users` | Fetch all users with profile/credential info |
| `GET /api/v1/apps` | Fetch all applications |
| `GET /api/v1/groups` | Fetch all groups |
| `GET /api/v1/policies?type=OKTA_SIGN_ON` | Global session policies |
| `GET /api/v1/policies?type=MFA_ENROLL` | MFA enrollment policies |
| `GET /api/v1/policies?type=ACCESS_POLICY` | Authentication policies |
| `GET /api/v1/policies/{id}/rules` | Rules for each policy |
| `GET /api/v1/authenticators` | Available authenticators |
| `GET /api/v1/logs` | System logs with time range and filters |
| `GET /api/v1/org` | Org info for connection check |

---

## Customization

### Adding New Demo Steps
Edit the `DEMO_STEPS` array in `src/components/DemoFlowView.jsx`. Each step needs:
- `logFilters`: array of eventType substrings to match in system logs
- `actions`: checklist items for the SE
- `talkingPoints`: value-proposition bullets

### Modifying User Source Detection
The `detectUserSource()` function in `src/services/oktaApi.js` uses credential provider type and profile attributes. Customize for your org's specific HR integration patterns.

### Changing Log Categories
The `categorizeLogEvent()` function in `src/services/oktaApi.js` maps eventTypes to demo phases. Add new mappings as needed.

---

## License

Internal tool — built for Okta SE demo environments.
