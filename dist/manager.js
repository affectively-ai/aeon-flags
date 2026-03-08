import { parseUCAN, extractContextFromUCAN, getFlagCapability, } from './ucan.js';
export class FlagManager {
    flags = new Map();
    listeners = new Set();
    constructor(initialFlags = []) {
        for (const flag of initialFlags) {
            this.flags.set(flag.id, flag);
        }
    }
    /**
     * Subscribe to flag changes. Returns an unsubscribe function.
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * Remove all listeners and clean up resources.
     */
    destroy() {
        this.listeners.clear();
    }
    notify() {
        for (const listener of this.listeners) {
            listener();
        }
    }
    /**
     * Register or update a feature flag.
     */
    register(flag) {
        this.flags.set(flag.id, flag);
        this.notify();
    }
    /**
     * Get all registered flags.
     */
    getAllFlags() {
        return Array.from(this.flags.values());
    }
    /**
     * Evaluates if a feature flag is enabled for the given context/UCAN.
     */
    evaluate(flagId, options = {}) {
        if (!flagId) {
            return options.defaultValue ?? false;
        }
        const flag = this.flags.get(flagId);
        if (!flag) {
            return options.defaultValue ?? false;
        }
        let userContext = { ...options.context };
        // 1. Process UCAN if provided
        if (options.ucan) {
            const token = parseUCAN(options.ucan);
            if (token) {
                // Check for explicit capabilities
                const cap = getFlagCapability(token, flagId);
                if (cap === 'force_enable')
                    return true;
                if (cap === 'force_disable')
                    return false;
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
                // Custom matches function - wrap in try-catch to prevent crashes
                if (rule.matches) {
                    try {
                        if (!rule.matches(userContext)) {
                            return false;
                        }
                    }
                    catch {
                        // If the custom match function throws, treat as non-match
                        return false;
                    }
                }
                // Percentage Rollout (Deterministic based on userId, or random if no user)
                if (rule.rolloutPercentage !== undefined) {
                    // Validate rolloutPercentage is a finite number
                    if (!Number.isFinite(rule.rolloutPercentage))
                        return false;
                    // Clamp to 0-100 range
                    const percentage = Math.max(0, Math.min(100, rule.rolloutPercentage));
                    if (percentage <= 0)
                        return false;
                    if (percentage >= 100)
                        continue;
                    if (userContext.userId) {
                        // Hash userId for deterministic rollout
                        const hash = this.simpleHash(`${flagId}:${userContext.userId}`);
                        const percent = (hash % 100) + 1; // 1 to 100
                        if (percent > percentage) {
                            return false;
                        }
                    }
                    else {
                        // Random fallback if no userId
                        if (Math.random() * 100 > percentage) {
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
    generateESIVariables(options = {}) {
        const vars = {};
        for (const flagId of this.flags.keys()) {
            vars[`flag_${flagId}`] = this.evaluate(flagId, options) ? '1' : '0';
        }
        return vars;
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash + char) | 0;
        }
        return hash >>> 0; // Unsigned 32-bit
    }
}
