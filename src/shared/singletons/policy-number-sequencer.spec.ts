import { PolicyNumberSequencer } from './policy-number-sequencer';

describe('PolicyNumberSequencer', () => {
  const sequencer = PolicyNumberSequencer.getInstance();

  it('should return a policy number with format POL-YYYYMMDD-XXXXXX', () => {
    const number = sequencer.next();
    expect(number).toMatch(/^POL-\d{8}-\d{6}$/);
  });

  it('should increment the sequence on each call', () => {
    const first = sequencer.next();
    const second = sequencer.next();
    expect(first).not.toBe(second);
    // Extract sequence part (last 6 digits) and verify it increased by 1
    const firstSeq = parseInt(first.slice(-6), 10);
    const secondSeq = parseInt(second.slice(-6), 10);
    expect(secondSeq).toBe(firstSeq + 1);
  });
});
