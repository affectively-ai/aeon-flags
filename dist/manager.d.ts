import type { FeatureFlag, EvaluateOptions } from './types.js';
export declare class FlagManager {
    private flags;
    private listeners;
    constructor(initialFlags?: FeatureFlag[]);
    /**
     * Subscribe to flag changes. Returns an unsubscribe function.
     */
    subscribe(listener: () => void): () => void;
    private notify;
    /**
     * Register or update a feature flag.
     */
    register(flag: FeatureFlag): void;
    /**
     * Get all registered flags.
     */
    getAllFlags(): FeatureFlag[];
    /**
     * Evaluates if a feature flag is enabled for the given context/UCAN.
     */
    evaluate(flagId: string, options?: EvaluateOptions): boolean;
    /**
     * Helper function to build ESI variables based on the evaluated flags
     * Useful for caching variations at the Edge.
     */
    generateESIVariables(options?: EvaluateOptions): Record<string, string>;
    private simpleHash;
}
