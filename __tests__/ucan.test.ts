import { describe, it, expect } from 'bun:test';
import {
  parseUCAN,
  extractContextFromUCAN,
  getFlagCapability,
} from '../src/ucan.js';

describe('UCAN Utils', () => {
  const createToken = (payloadObj: any) => {
    const header = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(payloadObj));
    return `${header}.${payload}.signature`;
  };

  it('should parse valid UCAN token', () => {
    const tokenStr = createToken({ iss: 'did:123', aud: 'did:abc' });
    const token = parseUCAN(tokenStr);
    expect(token).not.toBeNull();
    expect(token?.payload.iss).toBe('did:123');
  });

  it('should return null for invalid UCAN token', () => {
    expect(parseUCAN('invalid.token')).toBeNull();
    expect(parseUCAN('too.many.parts.here')).toBeNull();
    expect(parseUCAN('not.base64.encoded')).toBeNull();
  });

  it('should extract context from UCAN', () => {
    const tokenStr = createToken({
      iss: 'user-1',
      aud: 'app',
      exp: 123,
      att: [],
      fct: [{ tier: 'enterprise' }, { attributes: { beta: true } }],
    });

    const token = parseUCAN(tokenStr)!;
    const context = extractContextFromUCAN(token);

    expect(context.userId).toBe('user-1');
    expect(context.tier).toBe('enterprise');
    expect(context.attributes).toEqual({ beta: true });
  });

  it('should handle missing facts when extracting context', () => {
    const tokenStr = createToken({
      iss: 'user-2',
      aud: 'app',
      exp: 123,
      att: [],
    });

    const token = parseUCAN(tokenStr)!;
    const context = extractContextFromUCAN(token);

    expect(context.userId).toBe('user-2');
    expect(context.tier).toBeUndefined();
    expect(context.attributes).toBeUndefined();
  });

  it('should extract capabilities for specific flag', () => {
    const tokenStr = createToken({
      iss: 'user-1',
      aud: 'app',
      exp: 123,
      att: [
        { with: 'flag:test-flag', can: 'force_enable' },
        { with: 'flag:other', can: 'force_disable' },
      ],
    });

    const token = parseUCAN(tokenStr)!;

    expect(getFlagCapability(token, 'test-flag')).toBe('force_enable');
    expect(getFlagCapability(token, 'other')).toBe('force_disable');
    expect(getFlagCapability(token, 'missing')).toBeNull();
  });

  it('should respect wildcard app:flags capabilities', () => {
    const tokenStr = createToken({
      iss: 'user-1',
      aud: 'app',
      exp: 123,
      att: [{ with: 'app:flags', can: '*' }],
    });

    const token = parseUCAN(tokenStr)!;

    expect(getFlagCapability(token, 'any-flag')).toBe('evaluate');
  });

  it('should fallback to Buffer when atob is undefined', () => {
    const originalAtob = globalThis.atob;
    // @ts-ignore
    globalThis.atob = undefined;

    try {
      const tokenStr = createToken({ iss: 'did:buffer', aud: 'did:abc' });
      const token = parseUCAN(tokenStr);
      expect(token).not.toBeNull();
      expect(token?.payload.iss).toBe('did:buffer');
    } finally {
      globalThis.atob = originalAtob;
    }
  });
});
