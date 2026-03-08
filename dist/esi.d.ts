/**
 * Edge Side Inference (ESI) integrations for Goodchild.
 * Allows using feature flags as `<ESI.Flag name="foo">` in Aeon Flux environments,
 * evaluating rendering based on UCAN context without main-thread hydration.
 */
import type { ReactNode } from 'react';
export interface ESIFlagProps {
    name: string;
    fallback?: boolean;
    children: ReactNode;
}
/**
 * A theoretical helper representing how ESI might inject flag values into the DOM.
 * In a real Aeon Flux setup, this would emit an <esi:flag> tag that the Cloudflare Worker intercepts.
 */
export declare function generateESIFlagTag(name: string, content: string, fallbackContent?: string): string;
