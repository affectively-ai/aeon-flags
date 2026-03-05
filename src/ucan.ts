import type { UCANToken, UserContext } from './types.js';

/**
 * Basic parsing of a JWT/UCAN token string.
 * Note: This does not verify the signature. Verification should happen
 * at the edge gateway or using a dedicated verification library before evaluation.
 */
export function parseUCAN(tokenStr: string): UCANToken | null {
  try {
    const parts = tokenStr.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    return {
      header,
      payload,
      signature: parts[2],
    };
  } catch (e) {
    return null;
  }
}

/**
 * Extracts UserContext (like userId and tier) from a UCAN token's facts.
 */
export function extractContextFromUCAN(token: UCANToken): UserContext {
  const context: UserContext = {
    userId: token.payload.iss, // Issuer is usually the user DID/ID
  };

  // Look for facts that define tier or other attributes
  if (token.payload.fct && Array.isArray(token.payload.fct)) {
    for (const fact of token.payload.fct) {
      if (fact.tier) {
        context.tier = fact.tier;
      }
      if (fact.attributes) {
        context.attributes = { ...context.attributes, ...fact.attributes };
      }
    }
  }

  return context;
}

/**
 * Checks if the UCAN token grants explicit capability to evaluate or force a flag.
 */
export function getFlagCapability(
  token: UCANToken,
  flagId: string
): 'force_enable' | 'force_disable' | 'evaluate' | null {
  for (const cap of token.payload.att) {
    if (cap.with === `flag:${flagId}` || cap.with === 'app:flags') {
      if (cap.can === 'force_enable') return 'force_enable';
      if (cap.can === 'force_disable') return 'force_disable';
      if (cap.can === 'evaluate' || cap.can === '*') return 'evaluate';
    }
  }
  return null;
}

// Fallback basic base64 decoder for environments without full Buffer/atob
function atob(b64: string): string {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(b64);
  }
  // @ts-ignore fallback for Node.js environments
  return Buffer.from(b64, 'base64').toString('utf8');
}
