import React, { useState, useEffect, useMemo } from 'react';
import { useSystemLogs } from '../hooks/useOktaData';

const DEMO_STEPS = [
  {
    id: 'ud',
    tag: 'UD',
    label: 'Universal Directory',
    title: 'JIT Provisioning from Active Directory',
    color: '#0F6CBD',
    icon: '👤',
    description: 'Sarah Chen logs in for the first time. Her AD credentials trigger JIT provisioning into Okta Universal Directory.',
    actions: [
      'Navigate to Okta login page',
      'Enter AD credentials (sarah.chen@acmecorp.com)',
      'Observe JIT provisioning in UD',
      'Show profile attributes synced from AD',
      'Show group memberships imported',
    ],
    logFilters: ['user.lifecycle.create', 'user.lifecycle.activate', 'directory'],
    talkingPoints: [
      'UD is the single source of truth — enriches AD data with Okta attributes',
      'JIT means no manual provisioning — user exists the moment they authenticate',
      'Profile mastering controls which system owns each attribute',
      'AD agent runs on-prem, encrypted tunnel to Okta cloud',
    ],
  },
  {
    id: 'sso',
    tag: 'SSO',
    label: 'Single Sign-On',
    title: 'Accessing Microsoft 365',
    color: '#2E7D32',
    icon: '🔑',
    description: 'Sarah clicks the O365 tile in her Okta dashboard. SAML assertion federates her identity to Microsoft.',
    actions: [
      'Show Okta dashboard with assigned apps',
      'Click Microsoft 365 tile',
      'Observe seamless SSO (no password re-entry)',
      'Show SAML assertion in browser dev tools',
      'Open Outlook/Teams to confirm access',
    ],
    logFilters: ['user.authentication.sso', 'app.auth.sso', 'user.session'],
    talkingPoints: [
      'One login, access to all apps — that\'s the SSO promise',
      'SAML 2.0 is the gold standard for enterprise federation',
      'App assignment is group-based — add to group, get the app',
      'Session policies control idle timeout and max lifetime',
    ],
  },
  {
    id: 'lcm',
    tag: 'LCM',
    label: 'Lifecycle Management',
    title: 'Provisioned into Salesforce',
    color: '#E65100',
    icon: '⚙️',
    description: 'Sarah is added to the CRM Migration Team group. Okta auto-provisions her Salesforce account via SCIM.',
    actions: [
      'Add Sarah to "CRM-Migration-Team" group in Okta',
      'Show group rule triggering app assignment',
      'Observe SCIM provisioning event to Salesforce',
      'Log into Salesforce to confirm account creation',
      'Show Salesforce appears on Sarah\'s Okta dashboard',
    ],
    logFilters: ['application.provision', 'application.user_membership', 'group.user_membership'],
    talkingPoints: [
      'SCIM automates the entire user lifecycle in downstream apps',
      'Group-based assignment = zero-touch provisioning at scale',
      'Deprovisioning deactivates (not deletes) — preserving audit data',
      'Profile mapping ensures correct role/permissions in Salesforce',
    ],
  },
  {
    id: 'amfa',
    tag: 'AMFA',
    label: 'Adaptive MFA',
    title: 'Step-Up Auth from New Location',
    color: '#9C27B0',
    icon: '🛡️',
    description: 'Sarah tries Salesforce from a hotel WiFi in another city. Risk score spikes, triggering step-up MFA.',
    actions: [
      'Access Salesforce from a different browser/network/location',
      'Observe the MFA challenge prompt',
      'Complete Okta Verify push with number matching',
      'Show the risk signals in system log (new IP, new city)',
      'Compare: no MFA when on corporate network',
    ],
    logFilters: ['user.authentication.auth_via_mfa', 'user.mfa', 'policy.evaluate', 'security.threat'],
    talkingPoints: [
      'Adaptive = only challenge when risk is elevated',
      'Risk signals: new IP, new device, new city, impossible travel',
      'Number matching prevents MFA fatigue attacks',
      'Behavior baseline learns over 14 days',
      'Phishing-resistant factors like Okta Verify or FIDO2 WebAuthn',
    ],
  },
];

function StepPanel({ step, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 18px',
        borderRadius: 12,
        background: isActive ? `${step.color}12` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? `${step.color}44` : 'rgba(255,255,255,0.04)'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderLeft: `3px solid ${isActive ? step.color : 'transparent'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>{step.icon}</span>
        <span style={{
          padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
          background: `${step.color}22`, color: step.color,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {step.tag}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>
          {step.label}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingLeft: 28 }}>{step.title}</div>
    </div>
  );
}

function LiveLogPanel({ logs, step }) {
  const relevant = useMemo(() => {
    if (!step || !logs.length) return [];
    return logs.filter((log) => {
      return step.logFilters.some((filter) =>
        log.eventType?.toLowerCase().includes(filter.toLowerCase())
      );
    }).slice(0, 20);
  }, [logs, step]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.25)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#22C55E',
            animation: 'pulse-glow 1.5s infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
            LIVE LOGS — {step?.tag || 'ALL'}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
          {relevant.length} events
        </span>
      </div>
      <div style={{ maxHeight: 300, overflow: 'auto', padding: 8 }}>
        {relevant.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
            Perform the demo actions to see related log events appear here in real-time.
          </div>
        ) : (
          relevant.map((log) => (
            <div key={log.uuid} style={{
              padding: '6px 10px', borderRadius: 6, marginBottom: 4,
              background: 'rgba(255,255,255,0.02)',
              borderLeft: `2px solid ${step.color}44`,
              animation: 'slideIn 0.2s ease forwards',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {new Date(log.published).toLocaleTimeString()}
                </span>
                <span style={{
                  fontSize: 9, padding: '0 4px', borderRadius: 3,
                  background: log.outcome?.result === 'SUCCESS' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: log.outcome?.result === 'SUCCESS' ? '#22C55E' : '#EF4444',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {log.outcome?.result}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                {log.displayMessage}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                {log.eventType}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DemoFlowView() {
  const [activeStep, setActiveStep] = useState(0);
  const [demoStarted, setDemoStarted] = useState(false);

  const { logs } = useSystemLogs({
    autoRefresh: demoStarted,
    intervalMs: 5000,
    since: new Date(Date.now() - 3600000).toISOString(),
  });

  const step = DEMO_STEPS[activeStep];

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Demo Flow</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Interactive walkthrough — UD → SSO → LCM → AMFA
          </p>
        </div>
        <button
          onClick={() => setDemoStarted(!demoStarted)}
          style={{
            padding: '10px 20px', borderRadius: 10,
            border: `1px solid ${demoStarted ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
            background: demoStarted ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: demoStarted ? '#EF4444' : '#22C55E',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: demoStarted ? '#EF4444' : '#22C55E',
            animation: demoStarted ? 'pulse-glow 1.5s infinite' : 'none',
          }} />
          {demoStarted ? 'Stop Demo' : 'Start Demo'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {DEMO_STEPS.map((s, i) => (
          <div key={s.id} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= activeStep ? s.color : 'rgba(255,255,255,0.06)',
            transition: 'background 0.4s ease',
          }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Step list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DEMO_STEPS.map((s, i) => (
            <StepPanel key={s.id} step={s} isActive={i === activeStep} onClick={() => setActiveStep(i)} />
          ))}
        </div>

        {/* Active step detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header */}
          <div style={{
            background: `${step.color}08`, border: `1px solid ${step.color}22`,
            borderRadius: 14, padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{step.icon}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: `${step.color}33`, color: step.color,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    STEP {activeStep + 1} — {step.tag}
                  </span>
                </div>
                <h2 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700 }}>{step.title}</h2>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
              {step.description}
            </p>
          </div>

          {/* Actions checklist */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 20,
          }}>
            <h3 style={{
              margin: '0 0 12px 0', fontSize: 12, fontWeight: 700,
              color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.08em',
            }}>
              DEMO ACTIONS
            </h3>
            {step.actions.map((action, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `1.5px solid ${step.color}44`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginTop: 1,
                  cursor: 'pointer', fontSize: 10,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{action}</span>
              </div>
            ))}
          </div>

          {/* Talking points */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 20,
          }}>
            <h3 style={{
              margin: '0 0 12px 0', fontSize: 12, fontWeight: 700,
              color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.08em',
            }}>
              KEY TALKING POINTS
            </h3>
            {step.talkingPoints.map((point, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '6px 0',
                borderBottom: i < step.talkingPoints.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ color: step.color, fontSize: 12, marginTop: 2 }}>▸</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{point}</span>
              </div>
            ))}
          </div>

          {/* Live logs for this phase */}
          <LiveLogPanel logs={logs} step={step} />

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              style={{
                padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)', color: activeStep === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                cursor: activeStep === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveStep(Math.min(DEMO_STEPS.length - 1, activeStep + 1))}
              disabled={activeStep === DEMO_STEPS.length - 1}
              style={{
                padding: '10px 20px', borderRadius: 10,
                border: `1px solid ${activeStep === DEMO_STEPS.length - 1 ? 'rgba(255,255,255,0.08)' : step.color}`,
                background: activeStep === DEMO_STEPS.length - 1 ? 'rgba(255,255,255,0.03)' : `${step.color}22`,
                color: activeStep === DEMO_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : step.color,
                cursor: activeStep === DEMO_STEPS.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600,
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
