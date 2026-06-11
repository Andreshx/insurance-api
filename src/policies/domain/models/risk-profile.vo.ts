export type RiskProfileProperties = Readonly<Record<string, unknown>>;

export class RiskProfile {
  constructor(private readonly properties: RiskProfileProperties) {}

  getProperties(): RiskProfileProperties {
    return this.properties;
  }

  getNumberValue(key: string): number | undefined {
    const value = this.properties[key];

    return typeof value === 'number' ? value : undefined;
  }
}