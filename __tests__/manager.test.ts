import { describe, it, expect } from 'bun:test';
import { FlagManager } from '../src/manager.js';
import type { FeatureFlag, UCANToken } from '../src/types.js';

describe('FlagManager', () => {
  it('should initialize with flags and evaluate base enabled state', () => {
    const flags: FeatureFlag[] = [
      { id: 'flag1', enabled: true },
      { id: 'flag2', enabled: false },
    ];
    const manager = new FlagManager(flags);

    expect(manager.evaluate('flag1')).toBe(true);
    expect(manager.evaluate('flag2')).toBe(false);
    expect(manager.evaluate('nonexistent', { defaultValue: true })).toBe(true);
  });

  it('should register new flags', () => {
    const manager = new FlagManager();
    manager.register({ id: 'flag3', enabled: true });
    expect(manager.evaluate('flag3')).toBe(true);
  });

  it('should evaluate tier gating', () => {
    const manager = new FlagManager([
      {
        id: 'premium-feature',
        enabled: true,
        rules: [{ tiers: ['premium', 'enterprise'] }],
      },
    ]);

    // No context
    expect(manager.evaluate('premium-feature')).toBe(false);
    // Wrong tier
    expect(
      manager.evaluate('premium-feature', { context: { tier: 'free' } })
    ).toBe(false);
    // Correct tier
    expect(
      manager.evaluate('premium-feature', { context: { tier: 'premium' } })
    ).toBe(true);
    expect(
      manager.evaluate('premium-feature', { context: { tier: 'enterprise' } })
    ).toBe(true);
  });

  it('should evaluate custom matches function', () => {
    const manager = new FlagManager([
      {
        id: 'beta-testers',
        enabled: true,
        rules: [{ matches: (ctx) => ctx.attributes?.isBeta === true }],
      },
    ]);

    expect(manager.evaluate('beta-testers')).toBe(false);
    expect(
      manager.evaluate('beta-testers', {
        context: { attributes: { isBeta: false } },
      })
    ).toBe(false);
    expect(
      manager.evaluate('beta-testers', {
        context: { attributes: { isBeta: true } },
      })
    ).toBe(true);
  });

  it('should evaluate deterministic rollouts based on userId', () => {
    const manager = new FlagManager([
      {
        id: 'rollout-feature',
        enabled: true,
        rules: [{ rolloutPercentage: 50 }],
      },
    ]);

    // Results will be deterministic per user ID
    let enabledCount = 0;
    for (let i = 0; i < 100; i++) {
      if (
        manager.evaluate('rollout-feature', {
          context: { userId: `user-${i}` },
        })
      ) {
        enabledCount++;
      }
    }

    // It should be roughly 50, but because of simple hash, allow some variance
    expect(enabledCount).toBeGreaterThan(30);
    expect(enabledCount).toBeLessThan(70);
  });

  it('should evaluate random rollouts if no userId', () => {
    const manager = new FlagManager([
      {
        id: 'random-feature',
        enabled: true,
        rules: [{ rolloutPercentage: 50 }],
      },
    ]);

    let enabledCount = 0;
    for (let i = 0; i < 100; i++) {
      if (manager.evaluate('random-feature')) {
        enabledCount++;
      }
    }

    expect(enabledCount).toBeGreaterThan(20);
    expect(enabledCount).toBeLessThan(80);
  });

  it('should respect rollout edges', () => {
    const manager = new FlagManager([
      { id: 'zero', enabled: true, rules: [{ rolloutPercentage: 0 }] },
      { id: 'hundred', enabled: true, rules: [{ rolloutPercentage: 100 }] },
    ]);

    expect(manager.evaluate('zero', { context: { userId: '123' } })).toBe(
      false
    );
    expect(manager.evaluate('hundred', { context: { userId: '123' } })).toBe(
      true
    );
  });

  it('should generate ESI variables', () => {
    const manager = new FlagManager([
      { id: 'f1', enabled: true },
      { id: 'f2', enabled: false },
    ]);

    const vars = manager.generateESIVariables();
    expect(vars).toEqual({
      flag_f1: '1',
      flag_f2: '0',
    });
  });

  it('should process UCAN force_enable capability', () => {
    const manager = new FlagManager([
      { id: 'secret', enabled: false }, // disabled by default
    ]);

    const header = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        iss: 'did:key:123',
        aud: 'did:key:abc',
        exp: 9999999999,
        att: [{ with: 'flag:secret', can: 'force_enable' }],
      })
    );
    const token = `${header}.${payload}.signature`;

    expect(manager.evaluate('secret')).toBe(false);
    expect(manager.evaluate('secret', { ucan: token })).toBe(true);
  });

  it('should process UCAN force_disable capability', () => {
    const manager = new FlagManager([
      { id: 'public', enabled: true }, // enabled by default
    ]);

    const header = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        iss: 'did:key:123',
        aud: 'did:key:abc',
        exp: 9999999999,
        att: [{ with: 'flag:public', can: 'force_disable' }],
      })
    );
    const token = `${header}.${payload}.signature`;

    expect(manager.evaluate('public')).toBe(true);
    expect(manager.evaluate('public', { ucan: token })).toBe(false);
  });

  it('should extract context from UCAN correctly', () => {
    const manager = new FlagManager([
      { id: 'pro', enabled: true, rules: [{ tiers: ['pro'] }] },
    ]);

    const header = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        iss: 'user123',
        aud: 'system',
        exp: 9999999999,
        att: [],
        fct: [{ tier: 'pro' }],
      })
    );
    const token = `${header}.${payload}.signature`;

    expect(manager.evaluate('pro')).toBe(false);
    expect(manager.evaluate('pro', { ucan: token })).toBe(true);
  });
});
