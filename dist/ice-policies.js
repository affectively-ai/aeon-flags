// ── Flag IDs ────────────────────────────────────────────────
export const ICE_FLAG_IDS = {
    enabled: 'ice.enabled',
    whiteEnabled: 'ice.white.enabled',
    grayEnabled: 'ice.gray.enabled',
    blackEnabled: 'ice.black.enabled',
    mirrorEnabled: 'ice.mirror.enabled',
    autoEscalation: 'ice.auto_escalation.enabled',
    deployGate: 'ice.deploy_gate.enabled',
    mcpGate: 'ice.mcp_gate.enabled',
    crossDevice: 'ice.cross_device.enabled',
};
// ── Factory ─────────────────────────────────────────────────
export function createIceFlags() {
    return [
        { id: ICE_FLAG_IDS.enabled, enabled: true },
        { id: ICE_FLAG_IDS.whiteEnabled, enabled: true },
        { id: ICE_FLAG_IDS.grayEnabled, enabled: true },
        { id: ICE_FLAG_IDS.blackEnabled, enabled: true },
        { id: ICE_FLAG_IDS.mirrorEnabled, enabled: true },
        { id: ICE_FLAG_IDS.autoEscalation, enabled: true },
        { id: ICE_FLAG_IDS.deployGate, enabled: true },
        { id: ICE_FLAG_IDS.mcpGate, enabled: true },
        { id: ICE_FLAG_IDS.crossDevice, enabled: false },
    ];
}
/**
 * Register all ICE policy flags with a FlagManager.
 */
export function registerIceFlags(manager) {
    for (const flag of createIceFlags()) {
        manager.register(flag);
    }
}
