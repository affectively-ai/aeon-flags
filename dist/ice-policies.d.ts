import type { FeatureFlag } from './types.js';
import type { FlagManager } from './manager.js';
export declare const ICE_FLAG_IDS: {
    readonly enabled: "ice.enabled";
    readonly whiteEnabled: "ice.white.enabled";
    readonly grayEnabled: "ice.gray.enabled";
    readonly blackEnabled: "ice.black.enabled";
    readonly mirrorEnabled: "ice.mirror.enabled";
    readonly autoEscalation: "ice.auto_escalation.enabled";
    readonly deployGate: "ice.deploy_gate.enabled";
    readonly mcpGate: "ice.mcp_gate.enabled";
    readonly crossDevice: "ice.cross_device.enabled";
};
export declare function createIceFlags(): FeatureFlag[];
/**
 * Register all ICE policy flags with a FlagManager.
 */
export declare function registerIceFlags(manager: FlagManager): void;
