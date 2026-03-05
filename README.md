# @affectively/aeon-flags

Feature flag and configuration management for the Aeon ecosystem.

## Installation

```bash
npm install @affectively/aeon-flags
```

## Usage

```typescript
import { flags, FlagManager } from '@affectively/aeon-flags';

flags.setFlag('beta-feature', true);

if (flags.getFlag('beta-feature')) {
  // do something new
}
```
