import React, { useState } from 'react';
import { useMFAPolicies, useAuthenticators } from '../hooks/useOktaData';

const POLICY_TYPE_META = {
  OKTA_SIGN_ON: { label: 'Global Session Policy', color: '#0F6CBD', icon: '🌐' },
  MFA_ENROLL: { label: 'MFA Enrollment Policy', color: '#9C27B0', icon: '🛡️' },
  ACCESS_POLICY: { label: 'Authentication Policy', color: '#E65100', icon: '🔐' },
};

function PolicyCard({ policy }) {
  const [expanded, setExpanded] = useState(false);
  const meta = POLICY_TYPE_META[policy.type] || { label: policy.type, color: '#9E9E9E', icon: '❓' };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onMouseEnter={(e) => { e.currentTarget.parentElement.style.borderColor = `${meta.color}44`; }}
        onMouseLeave={(e) => { e.currentTarget.parentElement.style.borderColor = 'rgba(255,255,255,0.06)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `${meta.color}18`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
          }}>
            {meta.icon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{policy.name}</div>
            {policy.description && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {policy.description}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: `${meta.color}22`, color: meta.color,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {meta.label}
          </span>
          <span style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
            background: policy.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: policy.status === 'ACTIVE' ? '#22C55E' : '#EF4444',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {policy.status}
          </span>
          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.3)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            P{policy.priority}
          </span>
          <span style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease', fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Rules */}
      {expanded && policy.rules && policy.rules.length > 0 && (
        <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }} className="animate-fadeIn">
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em',
            padding: '12px 0 8px',
          }}>
            RULES ({policy.rules.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {policy.rules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} policyColor={meta.color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RuleCard({ rule, policyColor }) {
  const [showDetails, setShowDetails] = useState(false);

  // Extract meaningful info from conditions and actions
  const conditionSummary = summarizeConditions(rule.conditions);
  const actionSummary = summarizeActions(rule.actions);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 10,
        padding: '12px 16px',
        borderLeft: `3px solid ${policyColor}44`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{rule.name}</span>
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,0.3)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Priority {rule.priority}
          </span>
        </div>
        <span style={{
          padding: '2px 6px', borderRadius: 4, fontSize: 9,
          background: rule.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          color: rule.status === 'ACTIVE' ? '#22C55E' : '#EF4444',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {rule.status}
        </span>
      </div>

      {/* Conditions */}
      {conditionSummary.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>IF: </span>
          {conditionSummary.map((c, i) => (
            <span key={i} style={{
              padding: '1px 6px', borderRadius: 4, fontSize: 11,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
              marginRight: 4, fontFamily: 'JetBrains Mono, monospace',
            }}>
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {actionSummary.length > 0 && (
        <div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>THEN: </span>
          {actionSummary.map((a, i) => (
            <span key={i} style={{
              padding: '1px 6px', borderRadius: 4, fontSize: 11,
              background: `${policyColor}15`, color: policyColor,
              marginRight: 4, fontFamily: 'JetBrains Mono, monospace',
            }}>
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Raw JSON toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          marginTop: 8, padding: '2px 8px', borderRadius: 4, border: 'none',
          background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)',
          fontSize: 10, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {showDetails ? 'Hide' : 'Show'} raw config
      </button>
      {showDetails && (
        <pre style={{
          marginTop: 8, padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.3)',
          fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.5)',
          overflow: 'auto', maxHeight: 200,
        }}>
          {JSON.stringify({ conditions: rule.conditions, actions: rule.actions }, null, 2)}
        </pre>
      )}
    </div>
  );
}

function summarizeConditions(conditions) {
  if (!conditions) return [];
  const summary = [];

  if (conditions.network?.connection) {
    summary.push(`Network: ${conditions.network.connection}`);
  }
  if (conditions.people?.users?.include?.length) {
    summary.push(`Users: ${conditions.people.users.include.length} included`);
  }
  if (conditions.people?.groups?.include?.length) {
    summary.push(`Groups: ${conditions.people.groups.include.length} included`);
  }
  if (conditions.riskScore?.level) {
    summary.push(`Risk: ${conditions.riskScore.level}`);
  }
  if (conditions.platform) {
    const platforms = Object.keys(conditions.platform).filter((k) => conditions.platform[k]);
    if (platforms.length) summary.push(`Platforms: ${platforms.join(', ')}`);
  }
  if (conditions.authContext?.authType) {
    summary.push(`Auth: ${conditions.authContext.authType}`);
  }

  return summary.length ? summary : ['All users'];
}

function summarizeActions(actions) {
  if (!actions) return [];
  const summary = [];

  if (actions.signon?.access) {
    summary.push(`Access: ${actions.signon.access}`);
  }
  if (actions.signon?.requireFactor !== undefined) {
    summary.push(actions.signon.requireFactor ? 'MFA Required' : 'No MFA');
  }
  if (actions.signon?.factorPromptMode) {
    summary.push(`Prompt: ${actions.signon.factorPromptMode}`);
  }
  if (actions.signon?.session?.maxSessionIdleMinutes) {
    summary.push(`Idle: ${actions.signon.session.maxSessionIdleMinutes}min`);
  }
  if (actions.enroll?.self) {
    summary.push(`Self-enroll: ${actions.enroll.self}`);
  }
  if (actions.appSignOn?.access) {
    summary.push(`App Access: ${actions.appSignOn.access}`);
  }
  if (actions.appSignOn?.verificationMethod?.type) {
    summary.push(`Verify: ${actions.appSignOn.verificationMethod.type}`);
  }

  return summary;
}

function AuthenticatorsList() {
  const { data: authenticators, loading } = useAuthenticators();

  if (loading || !authenticators) return null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: 20, marginBottom: 20,
    }}>
      <h3 style={{
        margin: '0 0 14px 0', fontSize: 13, fontWeight: 700,
        color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.08em',
      }}>
        AVAILABLE AUTHENTICATORS
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {authenticators.map((auth) => (
          <div key={auth.id || auth.key} style={{
            padding: '8px 14px', borderRadius: 8,
            background: auth.status === 'ACTIVE' ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${auth.status === 'ACTIVE' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: auth.status === 'ACTIVE' ? '#22C55E' : '#9E9E9E',
            }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{auth.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
                {auth.key || auth.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PoliciesView() {
  const { data: policies, loading, error, refresh } = useMFAPolicies();

  // Group policies by type
  const grouped = {};
  if (policies) {
    policies.forEach((p) => {
      const type = p.type || 'OTHER';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(p);
    });
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>MFA & Auth Policies</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Authentication policies, MFA enrollment, and sign-on rules
          </p>
        </div>
        <button onClick={refresh} style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}>
          ↻ Refresh
        </button>
      </div>

      <AuthenticatorsList />

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Loading policies...</div>}
      {error && <div style={{ padding: 16, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 13 }}>{error}</div>}

      {Object.entries(grouped).map(([type, pols]) => {
        const meta = POLICY_TYPE_META[type] || { label: type, color: '#9E9E9E' };
        return (
          <div key={type} style={{ marginBottom: 24 }}>
            <h2 style={{
              fontSize: 15, fontWeight: 700, color: meta.color,
              marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: meta.color }} />
              {meta.label}
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                ({pols.length})
              </span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pols
                .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                .map((p) => <PolicyCard key={p.id} policy={p} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
