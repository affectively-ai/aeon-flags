import type { UCANToken, UserContext } from './types.js';
/**
 * Basic parsing of a JWT/UCAN token string.
 * Note: This does not verify the signature. Verification should happen
 * at the edge gateway or using a dedicated verification library before evaluation.
 */
export declare function parseUCAN(tokenStr: string): UCANToken | null;
/**
 * Extracts UserContext (like userId and tier) from a UCAN token's facts.
 */
export declare function extractContextFromUCAN(token: UCANToken): UserContext;
/**
 * Checks if the UCAN token grants explicit capability to evaluate or force a flag.
 */
export declare function getFlagCapability(token: UCANToken, flagId: string): 'force_enable' | 'force_disable' | 'evaluate' | null;
