import { ICE_FLAG_IDS, createIceFlags, registerIceFlags } from '../ice-policies';
import { FlagManager } from '../manager';

describe('ICE Policy Flags', () => {
  describe('ICE_FLAG_IDS', () => {
    it('has expected flag IDs', () => {
      expect(ICE_FLAG_IDS.enabled).toBe('ice.enabled');
      expect(ICE_FLAG_IDS.whiteEnabled).toBe('ice.white.enabled');
      expect(ICE_FLAG_IDS.grayEnabled).toBe('ice.gray.enabled');
      expect(ICE_FLAG_IDS.blackEnabled).toBe('ice.black.enabled');
      expect(ICE_FLAG_IDS.mirrorEnabled).toBe('ice.mirror.enabled');
      expect(ICE_FLAG_IDS.autoEscalation).toBe('ice.auto_escalation.enabled');
      expect(ICE_FLAG_IDS.deployGate).toBe('ice.deploy_gate.enabled');
      expect(ICE_FLAG_IDS.mcpGate).toBe('ice.mcp_gate.enabled');
      expect(ICE_FLAG_IDS.crossDevice).toBe('ice.cross_device.enabled');
    });
  });

  describe('createIceFlags', () => {
    it('creates flags for all ICE_FLAG_IDS', () => {
      const flags = createIceFlags();
      const ids = flags.map((f) => f.id);

      for (const id of Object.values(ICE_FLAG_IDS)) {
        expect(ids).toContain(id);
      }
    });

    it('enables most flags by default', () => {
      const flags = createIceFlags();
      const enabledFlags = flags.filter((f) => f.enabled);
      // All except cross_device
      expect(enabledFlags.length).toBe(flags.length - 1);
    });

    it('disables cross_device by default', () => {
      const flags = createIceFlags();
      const crossDevice = flags.find((f) => f.id === ICE_FLAG_IDS.crossDevice);
      expect(crossDevice?.enabled).toBe(false);
    });
  });

  describe('registerIceFlags', () => {
    it('registers all flags with FlagManager', () => {
      const manager = new FlagManager();
      registerIceFlags(manager);

      const allFlags = manager.getAllFlags();
      expect(allFlags.length).toBe(Object.keys(ICE_FLAG_IDS).length);

      for (const id of Object.values(ICE_FLAG_IDS)) {
        expect(manager.evaluate(id)).toBeDefined();
      }
    });

    it('master switch is enabled', () => {
      const manager = new FlagManager();
      registerIceFlags(manager);
      expect(manager.evaluate(ICE_FLAG_IDS.enabled)).toBe(true);
    });
  });
});
