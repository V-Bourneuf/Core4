/**
 * Okta API Service
 * 
 * Connects to your Okta tenant using the Okta Management API.
 * 
 * Required: Set these environment variables in .env:
 *   VITE_OKTA_ORG_URL=https://your-tenant.okta.com
 *   VITE_OKTA_API_TOKEN=your-api-token
 * 
 * The API token needs the following scopes:
 *   - okta.users.read
 *   - okta.apps.read  
 *   - okta.logs.read
 *   - okta.policies.read
 *   - okta.groups.read
 * 
 * IMPORTANT: In production, proxy these calls through a backend server.
 * For demo purposes, calls go through the Vite dev proxy (see vite.config.js + server/).
 */

const BASE_URL = import.meta.env.VITE_OKTA_ORG_URL || '';
const API_TOKEN = import.meta.env.VITE_OKTA_API_TOKEN || '';

// Use proxy in dev, direct in production with a backend
const API_BASE = import.meta.env.DEV ? '/api/okta' : `${BASE_URL}/api/v1`;

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': `SSWS ${API_TOKEN}`,
};

async function oktaFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Okta API Error: ${response.status} - ${error.errorSummary || response.statusText}`
    );
  }

  const data = await response.json();
  
  // Extract pagination link if present
  const linkHeader = response.headers.get('Link');
  const nextLink = linkHeader?.match(/<([^>]+)>;\s*rel="next"/)?.[1] || null;

  return { data, nextLink };
}


// ============================================================
// USERS
// ============================================================

/**
 * Fetch all users with their source information.
 * Returns users enriched with their provisioning source (AD, HR, CSV, Okta).
 */
export async function fetchUsers(limit = 200) {
  const { data: users } = await oktaFetch(`/users?limit=${limit}`);
  
  // Enrich each user with source information
  return users.map((user) => ({
    id: user.id,
    email: user.profile.email,
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    displayName: `${user.profile.firstName} ${user.profile.lastName}`,
    status: user.status,
    created: user.created,
    lastLogin: user.lastLogin,
    lastUpdated: user.lastUpdated,
    // Source detection logic
    source: detectUserSource(user),
    // Raw credentials for deeper inspection
    credentials: user.credentials,
    profile: user.profile,
  }));
}

/**
 * Detect where a user was provisioned from based on their credentials and profile.
 */
function detectUserSource(user) {
  const creds = user.credentials || {};
  const profile = user.profile || {};

  // Check for AD (delegated auth or AD-mastered)
  if (creds.provider?.type === 'ACTIVE_DIRECTORY') {
    return {
      type: 'AD',
      label: 'Active Directory',
      color: '#0F6CBD',
      icon: '🏢',
      detail: creds.provider.name || 'AD Integration',
    };
  }

  // Check for LDAP
  if (creds.provider?.type === 'LDAP') {
    return {
      type: 'LDAP',
      label: 'LDAP Directory',
      color: '#6366F1',
      icon: '📂',
      detail: creds.provider.name || 'LDAP',
    };
  }

  // Check for Social/Federation
  if (creds.provider?.type === 'SOCIAL' || creds.provider?.type === 'FEDERATION') {
    return {
      type: 'FEDERATION',
      label: 'Federated IdP',
      color: '#EC4899',
      icon: '🌐',
      detail: creds.provider.name || 'External IdP',
    };
  }

  // Check for Import (CSV, HR system)
  // Users imported via CSV typically have IMPORT as their provider
  if (creds.provider?.type === 'IMPORT') {
    // Check if it's HR-sourced by looking at profile attributes
    if (profile.employeeNumber || profile.department) {
      return {
        type: 'HR',
        label: 'HR System (Import)',
        color: '#F59E0B',
        icon: '👥',
        detail: 'HR / Workday / BambooHR',
      };
    }
    return {
      type: 'CSV',
      label: 'CSV Import',
      color: '#8B5CF6',
      icon: '📄',
      detail: 'Bulk Import',
    };
  }

  // Default: Okta-mastered (created directly in Okta)
  return {
    type: 'OKTA',
    label: 'Okta (Cloud)',
    color: '#0F6CBD',
    icon: '☁️',
    detail: 'Created in Okta',
  };
}


// ============================================================
// APPLICATIONS
// ============================================================

/**
 * Fetch all applications with integration type details.
 */
export async function fetchApplications(limit = 200) {
  const { data: apps } = await oktaFetch(`/apps?limit=${limit}`);

  return apps.map((app) => ({
    id: app.id,
    name: app.name,
    label: app.label,
    status: app.status,
    created: app.created,
    lastUpdated: app.lastUpdated,
    signOnMode: app.signOnMode,
    // Detect integration type
    integration: detectIntegrationType(app),
    // Logo
    logo: app._links?.logo?.[0]?.href || null,
    // Features
    features: app.features || [],
    // Provisioning
    hasProvisioning: (app.features || []).some(
      (f) => f === 'PUSH_NEW_USERS' || f === 'PUSH_PROFILE_UPDATES'
    ),
    // Visibility
    visibility: app.visibility,
  }));
}

/**
 * Detect the type of integration for an application.
 */
function detectIntegrationType(app) {
  const signOnMode = app.signOnMode || '';
  const name = app.name || '';

  // SAML apps
  if (signOnMode === 'SAML_2_0') {
    return {
      type: 'SAML',
      label: 'SAML 2.0',
      color: '#2E7D32',
      icon: '🔐',
      protocol: 'SAML 2.0',
    };
  }

  // OIDC / OAuth apps
  if (signOnMode === 'OPENID_CONNECT' || signOnMode.includes('OAUTH')) {
    return {
      type: 'OIDC',
      label: 'OIDC / OAuth 2.0',
      color: '#1976D2',
      icon: '🔑',
      protocol: 'OpenID Connect',
    };
  }

  // SWA (Secure Web Authentication - password vaulting)
  if (signOnMode.includes('SWA') || signOnMode === 'BROWSER_PLUGIN') {
    return {
      type: 'SWA',
      label: 'SWA (Password Vault)',
      color: '#E65100',
      icon: '🔒',
      protocol: 'Secure Web Auth',
    };
  }

  // WS-Federation
  if (signOnMode === 'WS_FEDERATION') {
    return {
      type: 'WS-FED',
      label: 'WS-Federation',
      color: '#7B1FA2',
      icon: '🏛️',
      protocol: 'WS-Federation',
    };
  }

  // Bookmark
  if (signOnMode === 'BOOKMARK') {
    return {
      type: 'BOOKMARK',
      label: 'Bookmark',
      color: '#78909C',
      icon: '🔗',
      protocol: 'None (link only)',
    };
  }

  // Auto-login
  if (signOnMode === 'AUTO_LOGIN') {
    return {
      type: 'AUTO',
      label: 'Auto Login',
      color: '#00897B',
      icon: '⚡',
      protocol: 'Form-based',
    };
  }

  return {
    type: 'OTHER',
    label: signOnMode || 'Unknown',
    color: '#9E9E9E',
    icon: '❓',
    protocol: signOnMode,
  };
}


// ============================================================
// MFA / AUTHENTICATION POLICIES
// ============================================================

/**
 * Fetch all authentication policies (Access Policies and MFA Enrollment).
 */
export async function fetchMFAPolicies() {
  // Fetch Access Policies (Sign-On Policies)
  const { data: signOnPolicies } = await oktaFetch('/policies?type=OKTA_SIGN_ON');
  
  // Fetch MFA Enrollment Policies
  const { data: mfaPolicies } = await oktaFetch('/policies?type=MFA_ENROLL');

  // Fetch Authentication Policies (for app-level)
  let accessPolicies = [];
  try {
    const { data } = await oktaFetch('/policies?type=ACCESS_POLICY');
    accessPolicies = data;
  } catch {
    // ACCESS_POLICY may not be available in all orgs
  }

  // Fetch rules for each policy
  const enrichPolicy = async (policy) => {
    try {
      const { data: rules } = await oktaFetch(`/policies/${policy.id}/rules`);
      return {
        id: policy.id,
        name: policy.name,
        description: policy.description,
        type: policy.type,
        status: policy.status,
        created: policy.created,
        lastUpdated: policy.lastUpdated,
        priority: policy.priority,
        conditions: policy.conditions,
        rules: rules.map((rule) => ({
          id: rule.id,
          name: rule.name,
          status: rule.status,
          priority: rule.priority,
          conditions: rule.conditions,
          actions: rule.actions,
        })),
      };
    } catch {
      return { ...policy, rules: [] };
    }
  };

  const allPolicies = [...signOnPolicies, ...mfaPolicies, ...accessPolicies];
  const enriched = await Promise.all(allPolicies.map(enrichPolicy));

  return enriched;
}

/**
 * Fetch available authenticators/factors in the org.
 */
export async function fetchAuthenticators() {
  try {
    const { data } = await oktaFetch('/authenticators');
    return data.map((auth) => ({
      id: auth.id,
      key: auth.key,
      name: auth.name,
      type: auth.type,
      status: auth.status,
      provider: auth.provider,
    }));
  } catch {
    // Fallback: fetch factors
    const { data } = await oktaFetch('/org/factors');
    return data;
  }
}


// ============================================================
// SYSTEM LOGS
// ============================================================

/**
 * Fetch system logs, optionally filtered.
 * 
 * @param {Object} options
 * @param {string} options.since - ISO date string (defaults to 1 hour ago)
 * @param {string} options.until - ISO date string (defaults to now)
 * @param {string} options.filter - Okta Expression Language filter
 * @param {string} options.q - Keyword search
 * @param {number} options.limit - Max results (default 100)
 */
export async function fetchSystemLogs(options = {}) {
  const {
    since = new Date(Date.now() - 3600000).toISOString(),
    until = new Date().toISOString(),
    filter = '',
    q = '',
    limit = 100,
  } = options;

  let endpoint = `/logs?since=${since}&until=${until}&limit=${limit}&sortOrder=DESCENDING`;
  if (filter) endpoint += `&filter=${encodeURIComponent(filter)}`;
  if (q) endpoint += `&q=${encodeURIComponent(q)}`;

  const { data: logs } = await oktaFetch(endpoint);

  return logs.map((log) => ({
    uuid: log.uuid,
    published: log.published,
    eventType: log.eventType,
    displayMessage: log.displayMessage,
    severity: log.severity,
    outcome: log.outcome,
    actor: log.actor
      ? {
          id: log.actor.id,
          type: log.actor.type,
          displayName: log.actor.displayName,
          alternateId: log.actor.alternateId,
        }
      : null,
    target: (log.target || []).map((t) => ({
      id: t.id,
      type: t.type,
      displayName: t.displayName,
      alternateId: t.alternateId,
    })),
    client: log.client
      ? {
          ipAddress: log.client.ipAddress,
          userAgent: log.client.userAgent,
          geographicalContext: log.client.geographicalContext,
          device: log.client.device,
          zone: log.client.zone,
        }
      : null,
    authenticationContext: log.authenticationContext,
    securityContext: log.securityContext,
    // Categorize the event for visual rendering
    category: categorizeLogEvent(log.eventType),
  }));
}

/**
 * Map an eventType to a visual category for the demo flow.
 */
function categorizeLogEvent(eventType) {
  if (!eventType) return { label: 'Other', color: '#9E9E9E', phase: 'unknown' };

  const mapping = {
    // Universal Directory events
    'user.lifecycle.create': { label: 'User Created', color: '#0F6CBD', phase: 'UD' },
    'user.lifecycle.activate': { label: 'User Activated', color: '#0F6CBD', phase: 'UD' },
    'user.lifecycle.deactivate': { label: 'User Deactivated', color: '#EF4444', phase: 'UD' },
    'user.lifecycle.update': { label: 'Profile Updated', color: '#0F6CBD', phase: 'UD' },
    'user.import.csv': { label: 'CSV Import', color: '#8B5CF6', phase: 'UD' },
    'directory.integration': { label: 'Directory Sync', color: '#0F6CBD', phase: 'UD' },

    // SSO events
    'user.authentication.sso': { label: 'SSO Login', color: '#2E7D32', phase: 'SSO' },
    'user.authentication.auth_via_IDP': { label: 'IdP Auth', color: '#2E7D32', phase: 'SSO' },
    'app.auth.sso': { label: 'App SSO', color: '#2E7D32', phase: 'SSO' },
    'user.session.start': { label: 'Session Start', color: '#2E7D32', phase: 'SSO' },

    // Lifecycle Management events
    'application.provision.user.push': { label: 'User Pushed to App', color: '#E65100', phase: 'LCM' },
    'application.provision.user.deactivate': { label: 'User Deprovisioned', color: '#E65100', phase: 'LCM' },
    'application.user_membership.add': { label: 'App Assignment', color: '#E65100', phase: 'LCM' },
    'application.user_membership.remove': { label: 'App Unassignment', color: '#E65100', phase: 'LCM' },
    'group.user_membership.add': { label: 'Group Assignment', color: '#E65100', phase: 'LCM' },
    'group.user_membership.remove': { label: 'Group Removal', color: '#E65100', phase: 'LCM' },

    // AMFA events
    'user.authentication.auth_via_mfa': { label: 'MFA Challenge', color: '#9C27B0', phase: 'AMFA' },
    'user.mfa.factor.activate': { label: 'Factor Enrolled', color: '#9C27B0', phase: 'AMFA' },
    'user.mfa.factor.deactivate': { label: 'Factor Removed', color: '#9C27B0', phase: 'AMFA' },
    'policy.evaluate_sign_on': { label: 'Sign-On Eval', color: '#9C27B0', phase: 'AMFA' },
    'security.threat.detected': { label: 'Threat Detected', color: '#EF4444', phase: 'AMFA' },
    'user.mfa.okta_verify.deny_push': { label: 'MFA Push Denied', color: '#EF4444', phase: 'AMFA' },
  };

  // Exact match
  if (mapping[eventType]) return mapping[eventType];

  // Partial match
  for (const [key, value] of Object.entries(mapping)) {
    if (eventType.includes(key.split('.').slice(-1)[0])) return value;
  }

  // Category-based fallback
  if (eventType.startsWith('user.authentication')) return { label: 'Authentication', color: '#2E7D32', phase: 'SSO' };
  if (eventType.startsWith('user.lifecycle')) return { label: 'Lifecycle', color: '#0F6CBD', phase: 'UD' };
  if (eventType.startsWith('user.mfa')) return { label: 'MFA', color: '#9C27B0', phase: 'AMFA' };
  if (eventType.startsWith('application.')) return { label: 'App Event', color: '#E65100', phase: 'LCM' };
  if (eventType.startsWith('policy.')) return { label: 'Policy', color: '#9C27B0', phase: 'AMFA' };

  return { label: 'System', color: '#78909C', phase: 'unknown' };
}


// ============================================================
// GROUPS
// ============================================================

export async function fetchGroups(limit = 200) {
  const { data: groups } = await oktaFetch(`/groups?limit=${limit}`);
  return groups.map((g) => ({
    id: g.id,
    name: g.profile.name,
    description: g.profile.description,
    type: g.type,
    memberCount: g._embedded?.stats?.usersCount || null,
    created: g.created,
    lastUpdated: g.lastUpdated,
    lastMembershipUpdated: g.lastMembershipUpdated,
  }));
}


// ============================================================
// HEALTH / CONNECTIVITY CHECK
// ============================================================

export async function checkConnection() {
  try {
    const { data } = await oktaFetch('/org');
    return {
      connected: true,
      orgName: data.name,
      orgUrl: data._links?.organization?.href || BASE_URL,
      subdomain: data.subdomain,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}
