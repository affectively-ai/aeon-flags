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

    const header = JSON.parse(decodeBase64(parts[0]));
    const payload = JSON.parse(decodeBase64(parts[1]));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Check not-before
    if (payload.nbf && payload.nbf > Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      header,
      payload,
      signature: parts[2],
    };
  } catch {
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
      if (fact.tier && typeof fact.tier === 'string') {
        context.tier = fact.tier;
      }
      if (fact.attributes && typeof fact.attributes === 'object' && fact.attributes !== null) {
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
  // Validate att is an array before iterating
  if (!Array.isArray(token.payload.att)) {
    return null;
  }

  for (const cap of token.payload.att) {
    if (!cap || typeof cap !== 'object') continue;
    if (cap.with === `flag:${flagId}` || cap.with === 'app:flags') {
      if (cap.can === 'force_enable') return 'force_enable';
      if (cap.can === 'force_disable') return 'force_disable';
      if (cap.can === 'evaluate' || cap.can === '*') return 'evaluate';
    }
  }
  return null;
}

// Base64 decoder with fallback for Node.js environments
function decodeBase64(b64: string): string {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(b64);
  }
  // Fallback for Node.js environments where atob may not be available.
  // Use dynamic access to avoid requiring @types/node.
  const g = globalThis as Record<string, unknown>;
  if (g['Buffer'] && typeof (g['Buffer'] as { from?: unknown }).from === 'function') {
    return (g['Buffer'] as { from: (s: string, e: string) => { toString: (e: string) => string } })
      .from(b64, 'base64')
      .toString('utf8');
  }
  return b64;
}
