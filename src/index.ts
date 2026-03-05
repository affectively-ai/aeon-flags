export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
}

export class FlagManager {
  private flags: Map<string, FeatureFlag> = new Map();

  constructor(initialFlags?: FeatureFlag[]) {
    if (initialFlags) {
      initialFlags.forEach(flag => this.flags.set(flag.name, flag));
    }
  }

  getFlag(name: string): boolean {
    return this.flags.get(name)?.enabled ?? false;
  }

  setFlag(name: string, enabled: boolean): void {
    const flag = this.flags.get(name);
    if (flag) {
      flag.enabled = enabled;
    } else {
      this.flags.set(name, { name, enabled });
    }
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}

export const flags = new FlagManager();
