# @affectively/aeon-flags

**The Goodchild Daemon: Feature Entitlement at the Edge**

Goodchild is a localized, UCAN-enforced feature gating and routing daemon. It replaces centralized, polling-based feature flag SaaS (like LaunchDarkly or CloudBees) with deterministic, edge-evaluated cryptographic entitlements. Say goodbye to expensive $10k+ yearly enterprise subscriptions.

## The Origin and the Irony

The name is a direct reference to Trevor Goodchild, the brilliant, autocratic ruler of the walled city of Bregna in *Aeon Flux*. In the lore, Goodchild is obsessed with absolute control, artificial borders, and centralized authority. He is the ultimate gatekeeper, deciding who gets access to what, and under what conditions.

In the context of the Aeon Shell architecture, naming our feature flag service Goodchild is an exercise in cyberpunk irony.

Traditional feature flag services act exactly like the original Trevor Goodchild: they are centralized, rent-seeking authorities sitting in a distant tower, constantly spying on the edge via telemetry, and phoning home to ask permission for every state change. By naming our decentralized, user-sovereign entitlement service "Goodchild," we are domesticating the tyrant. We have stripped him of his centralized power, severed his network connection, and reduced him to a blind, local enforcer of the user's cryptographic will.

## Architectural Semantics

The Goodchild daemon perfectly mirrors the strictness of its namesake, but applies that strictness locally. It operates under a zero-trust, fail-closed paradigm.

- **No Central Authority:** Goodchild does not poll a remote server to ask if a feature should be enabled. It lives at the edge.
- **Cryptographic Law:** Goodchild only responds to verified UCANs. If the token lacks the exact capability (`flag:<flag-name>`), Goodchild mathematically rejects the execution path.
- **Stateless Enforcement:** Goodchild cares about the signature, the audience, and the TTL. It does not track user identities or report telemetry back to a mothership.
- **The Inverted Power Dynamic:** The user (or the capability granter) holds the key. Goodchild is merely the lock.

Combined with **Edge Side Inference (ESI)**, `goodchild` brings your evaluations to the edge, dropping your CLS (Cumulative Layout Shift) to zero while executing in sub-milliseconds without hydration delays.

## Installation

```bash
bun add @affectively/aeon-flags
```

## Code as Lore

When a developer interacts with this service in the shell, the semantics carry the weight of the architecture. You aren't casually checking a remote boolean; you are demanding passage through a cryptographically sealed border.

Instead of an ambient `if (flags.isFeatureXEnabled)`, the execution path feels authoritative:

```typescript
import { FlagManager } from '@affectively/aeon-flags';

const Goodchild = new FlagManager([
  {
    id: 'experimental-ui',
    enabled: true,
    rules: [
      // Only show to premium and enterprise users
      { tiers: ['premium', 'enterprise'] },
      // 50% rollout among those users
      { rolloutPercentage: 50 }
    ]
  }
]);

// If the delegation chain is valid, the gate opens instantly with zero network latency.
// If it fails, Goodchild ruthlessly shunts the execution back to the baseline path.
const isEnabled = Goodchild.evaluate('experimental-ui', {
  ucan: userUcanToken,
  context: { userId: 'user-123', tier: 'premium' }
});
```

### React & Aeon-Flux Easy Mode

If you are using React or building inside the Aeon Flux ecosystem, Goodchild acts as a deterministic barrier, aggressively pruning nodes at render time before they even reach the DOM.

```tsx
import { GoodchildProvider, Guard } from '@affectively/aeon-flags/react';

function App() {
  return (
    <GoodchildProvider manager={Goodchild} context={{ tier: 'free' }}>
      <Dashboard />
    </GoodchildProvider>
  );
}

function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
      
      {/* If the flag evaluates to false, this node is destroyed at render time */}
      <Guard flag="experimental-ui" fallback={<p>Upgrade to Pro to see this feature</p>}>
        <ExperimentalProWidget />
      </Guard>
    </main>
  );
}
```

### Edge Side Inference (ESI) Integration

When running in Cloudflare Workers using the Aeon Flux architecture, flags can be mapped to ESI variables that instruct the edge HTML rewriter to dynamically include/exclude segments of your DOM before the browser even downloads it:

```typescript
// On the Worker
const esiVars = Goodchild.generateESIVariables({ ucan: requestUcan });
// esiVars = { "flag_experimental-ui": "1", "flag_ai-chat": "0" }
```

You can then use the provided tools to generate native ESI tags.

## License

MIT
