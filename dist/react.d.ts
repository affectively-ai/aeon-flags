import React, { type ReactNode } from 'react';
import { FlagManager } from './manager.js';
import type { UserContext } from './types.js';
interface GoodchildContextValue {
    manager: FlagManager;
    ucan?: string;
    context?: UserContext;
    version: number;
}
export interface GoodchildProviderProps {
    /** The Goodchild FlagManager instance */
    manager: FlagManager;
    /** Optional UCAN token for the current session */
    ucan?: string;
    /** Optional explicit user context */
    context?: UserContext;
    children: ReactNode;
}
/**
 * Goodchild Provider
 * Wraps your application to provide UCAN-powered feature flags context.
 */
export declare function GoodchildProvider({ manager, ucan, context, children, }: GoodchildProviderProps): React.JSX.Element;
/**
 * Hook to access the raw Goodchild manager and current context
 */
export declare function useGoodchild(): GoodchildContextValue;
/**
 * Hook to evaluate a specific feature flag
 * @param flagId The ID of the feature flag to evaluate
 * @param defaultValue Fallback value if the flag is not found
 */
export declare function useFlag(flagId: string, defaultValue?: boolean): boolean;
export interface GuardProps {
    /** The feature flag ID to evaluate */
    flag: string;
    /** Fallback node to render if the flag is disabled */
    fallback?: ReactNode;
    children: ReactNode;
}
/**
 * `<Guard>`
 * Conditionally renders its children only if the specified Goodchild feature flag is enabled.
 * Drops the nodes at render time if unauthorized.
 *
 * @example
 * <Guard flag="experimental-ui" fallback={<p>Upgrade to Pro</p>}>
 *   <NewProDashboard />
 * </Guard>
 */
export declare function Guard({ flag, fallback, children, }: GuardProps): React.JSX.Element | null;
export {};
