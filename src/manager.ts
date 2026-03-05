import type { FeatureFlag, EvaluateOptions, UserContext } from './types.js';
import {
  parseUCAN,
  extractContextFromUCAN,
  getFlagCapability,
} from './ucan.js';

export class FlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor(initialFlags: FeatureFlag[] = []) {
    for (const flag of initialFlags) {
      this.flags.set(flag.id, flag);
    }
  }

  /**
   * Subscribe to flag changes. Returns an unsubscribe function.
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Register or update a feature flag.
   */
  public register(flag: FeatureFlag) {
    this.flags.set(flag.id, flag);
    this.notify();
  }

  /**
   * Get all registered flags.
   */
  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Evaluates if a feature flag is enabled for the given context/UCAN.
   */
  public evaluate(flagId: string, options: EvaluateOptions = {}): boolean {
    const flag = this.flags.get(flagId);
    if (!flag) {
      return options.defaultValue ?? false;
    }

    let userContext: UserContext = { ...options.context };

    // 1. Process UCAN if provided
    if (options.ucan) {
      const token = parseUCAN(options.ucan);
      if (token) {
        // Check for explicit capabilities
        const cap = getFlagCapability(token, flagId);
        if (cap === 'force_enable') return true;
        if (cap === 'force_disable') return false;

        // Extract context from UCAN facts
        const ucanContext = extractContextFromUCAN(token);
        userContext = { ...ucanContext, ...userContext }; // Explicit context overrides UCAN
      }
    }

    // 2. Base enabled state
    if (!flag.enabled) {
      return false;
    }

    // 3. Process Rules (Tier Gating, Rollouts, Custom Matches)
    if (flag.rules && flag.rules.length > 0) {
      for (const rule of flag.rules) {
        // Tier Gating
        if (rule.tiers && rule.tiers.length > 0) {
          if (!userContext.tier || !rule.tiers.includes(userContext.tier)) {
            return false;
          }
        }

        // Custom matches function
        if (rule.matches && !rule.matches(userContext)) {
          return false;
        }

        // Percentage Rollout (Deterministic based on userId, or random if no user)
        if (rule.rolloutPercentage !== undefined) {
          if (rule.rolloutPercentage <= 0) return false;
          if (rule.rolloutPercentage >= 100) continue;

          if (userContext.userId) {
            // Hash userId for deterministic rollout
            const hash = this.simpleHash(`${flagId}:${userContext.userId}`);
            const percent = (hash % 100) + 1; // 1 to 100
            if (percent > rule.rolloutPercentage) {
              return false;
            }
          } else {
            // Random fallback if no userId
            if (Math.random() * 100 > rule.rolloutPercentage) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  /**
   * Helper function to build ESI variables based on the evaluated flags
   * Useful for caching variations at the Edge.
   */
  public generateESIVariables(
    options: EvaluateOptions = {}
  ): Record<string, string> {
    const vars: Record<string, string> = {};
    for (const flagId of this.flags.keys()) {
      vars[`flag_${flagId}`] = this.evaluate(flagId, options) ? '1' : '0';
    }
    return vars;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
