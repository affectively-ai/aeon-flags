export interface UCANHeader {
  alg: string;
  typ: string;
  [key: string]: unknown;
}

export interface UCANToken {
  header: UCANHeader;
  payload: UCANPayload;
  signature: string;
}

export interface UCANPayload {
  iss: string;
  aud: string;
  exp: number;
  nbf?: number;
  att: UCANCapability[];
  fct?: Record<string, unknown>[];
  prf?: string[];
}

export interface UCANCapability {
  with: string; // e.g. "flag:my-feature" or "app:flags"
  can: string; // e.g. "evaluate", "read", "*"
  nb?: Record<string, unknown>;
}

export interface UserContext {
  userId?: string;
  tier?: string;
  attributes?: Record<string, unknown>;
}

export interface FlagRule {
  /** If specified, the flag is only evaluated for these tiers */
  tiers?: string[];
  /** Percentage rollout (0 to 100) */
  rolloutPercentage?: number;
  /** Custom matching function (if evaluated locally) */
  matches?: (context: UserContext) => boolean;
}

export interface FeatureFlag {
  id: string;
  enabled: boolean;
  rules?: FlagRule[];
}

export interface EvaluateOptions {
  /** Raw UCAN token string */
  ucan?: string;
  /** Explicit context if not fully contained in UCAN */
  context?: UserContext;
  /** Fallback value if flag is not found or cannot be evaluated */
  defaultValue?: boolean;
}
