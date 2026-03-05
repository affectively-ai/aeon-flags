import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useState, useEffect, } from 'react';
const GoodchildContext = createContext(null);
/**
 * Goodchild Provider
 * Wraps your application to provide UCAN-powered feature flags context.
 */
export function GoodchildProvider({ manager, ucan, context, children, }) {
    const [version, setVersion] = useState(0);
    useEffect(() => {
        return manager.subscribe(() => {
            setVersion((v) => v + 1);
        });
    }, [manager]);
    const value = useMemo(() => ({ manager, ucan, context, version }), [manager, ucan, context, version]);
    return (_jsx(GoodchildContext.Provider, { value: value, children: children }));
}
/**
 * Hook to access the raw Goodchild manager and current context
 */
export function useGoodchild() {
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
export function useFlag(flagId, defaultValue = false) {
    const ctx = useContext(GoodchildContext);
    // If no provider, safely return defaultValue
    if (!ctx)
        return defaultValue;
    return ctx.manager.evaluate(flagId, {
        ucan: ctx.ucan,
        context: ctx.context,
        defaultValue,
    });
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
export function Guard({ flag, fallback = null, children, }) {
    const isEnabled = useFlag(flag);
    return isEnabled ? _jsx(_Fragment, { children: children }) : _jsx(_Fragment, { children: fallback });
}
