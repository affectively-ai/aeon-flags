# @affectively/aeon-flags

`@affectively/aeon-flags` is a local feature-flag evaluator with optional UCAN-aware gating, React helpers, and edge-friendly output.

The project nickname is **Goodchild**, but the product story is simple: evaluate flags close to the app, keep rollout logic deterministic, and make it easy to hide or show UI without waiting on a hosted flag service round-trip.

## Why People May Like It

- flags can be evaluated locally instead of waiting on a remote check,
- rules support tiers, rollout percentages, and custom matching,
- UCAN tokens can contribute context or explicitly force a flag on or off,
- the React package gives you `GoodchildProvider`, `useFlag`, and `Guard`,
- and the ESI helpers can turn flag decisions into edge-rendered HTML branches.

That is the package's strongest fair brag: it is small, but it already covers plain TypeScript use, React use, and edge-rendered use.

## Install

```bash
bun add @affectively/aeon-flags
```

## Quick Start

```ts
import { FlagManager } from '@affectively/aeon-flags';

const flags = new FlagManager([
  {
    id: 'experimental-ui',
    enabled: true,
    rules: [
      { tiers: ['premium', 'enterprise'] },
      { rolloutPercentage: 50 },
    ],
  },
]);

const isEnabled = flags.evaluate('experimental-ui', {
  context: { userId: 'user-123', tier: 'premium' },
});
```

## What The Rules Can Do

- turn a flag on or off globally,
- limit a flag to certain account tiers,
- roll it out to a percentage of users,
- run custom match logic against local context,
- and accept UCAN-derived context when you have it.

If a UCAN includes an explicit capability for a flag, the manager can force that flag on or off immediately.

## React Helpers

```tsx
import { GoodchildProvider, Guard } from '@affectively/aeon-flags/react';

function App() {
  return (
    <GoodchildProvider manager={flags} context={{ tier: 'free' }}>
      <Dashboard />
    </GoodchildProvider>
  );
}

function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Guard flag="experimental-ui" fallback={<p>Upgrade to Pro to see this feature</p>}>
        <ExperimentalProWidget />
      </Guard>
    </main>
  );
}
```

That is one of the nicest things about the package: you can keep the flag logic out of your rendering code and let `Guard` handle the decision cleanly.

## Edge And ESI

The manager can generate a simple variable map for edge rendering:

```ts
const esiVars = flags.generateESIVariables({
  context: { userId: 'user-123', tier: 'premium' },
});
```

And the ESI helper can turn that into a branchable tag:

```ts
import { generateESIFlagTag } from '@affectively/aeon-flags/esi';

const html = generateESIFlagTag(
  'experimental-ui',
  '<div>Enabled branch</div>',
  '<div>Fallback branch</div>'
);
```

## Export Surface

- `@affectively/aeon-flags`: `FlagManager`, UCAN helpers, core types, and canned ice-policy helpers
- `@affectively/aeon-flags/react`: provider, hooks, and `Guard`
- `@affectively/aeon-flags/esi`: ESI tag helper

## Why This README Is Grounded

This package does not need lore to justify itself. The strongest fair brag is that it already gives you a compact, understandable flag system with local evaluation, UCAN-aware rules, React guards, and edge-friendly output.
