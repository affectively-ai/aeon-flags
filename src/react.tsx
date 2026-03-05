import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { FlagManager } from './manager.js';
import type { UserContext } from './types.js';

interface GoodchildContextValue {
  manager: FlagManager;
  ucan?: string;
  context?: UserContext;
  version: number; // Used to trigger re-renders
}

const GoodchildContext = createContext<GoodchildContextValue | null>(null);

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
export function GoodchildProvider({
  manager,
  ucan,
  context,
  children,
}: GoodchildProviderProps): React.JSX.Element {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    return manager.subscribe(() => {
      setVersion((v) => v + 1);
    });
  }, [manager]);

  const value = useMemo(
    () => ({ manager, ucan, context, version }),
    [manager, ucan, context, version]
  );

  return (
    <GoodchildContext.Provider value={value}>
      {children}
    </GoodchildContext.Provider>
  );
}

/**
 * Hook to access the raw Goodchild manager and current context
 */
export function useGoodchild(): GoodchildContextValue {
  const ctx = useContext(GoodchildContext);
  if (!ctx) {
    throw new Error('useGoodchild must be used within a GoodchildProvider.');
  }
  return ctx;
}

/**
 * Hook to evaluate a specific feature flag
 * @param flagId The ID of the feature flag to evaluate
 * @param defaultValue Fallback value if the flag is not found
 */
export function useFlag(flagId: string, defaultValue = false): boolean {
  const ctx = useContext(GoodchildContext);

  // If no provider, safely return defaultValue
  if (!ctx) return defaultValue;

  return ctx.manager.evaluate(flagId, {
    ucan: ctx.ucan,
    context: ctx.context,
    defaultValue,
  });
}

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
export function Guard({
  flag,
  fallback = null,
  children,
}: GuardProps): React.ReactNode {
  const isEnabled = useFlag(flag);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}
