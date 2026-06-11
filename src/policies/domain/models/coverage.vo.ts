export type CoverageProperties = Readonly<Record<string, unknown>>;

export class Coverage {
  constructor(private readonly properties: CoverageProperties) {}

  getProperties(): CoverageProperties {
    return this.properties;
  }
}