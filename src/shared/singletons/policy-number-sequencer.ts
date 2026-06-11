export class PolicyNumberSequencer {
  private static instance: PolicyNumberSequencer;

  private sequence = 1;

  private constructor() {}

  static getInstance(): PolicyNumberSequencer {
    if (!PolicyNumberSequencer.instance) {
      PolicyNumberSequencer.instance =
        new PolicyNumberSequencer();
    }

    return PolicyNumberSequencer.instance;
  }

  next(): string {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      now.getDate(),
    ).padStart(2, '0');

    const sequence = String(
      this.sequence++,
    ).padStart(6, '0');

    return `POL-${year}${month}${day}-${sequence}`;
  }
}