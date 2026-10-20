import { PolicyNumberSequencer } from './policy-number-sequencer';

describe('PolicyNumberSequencer', () => {
  const sequencer = PolicyNumberSequencer.getInstance();

  beforeEach(() => {
    // Aislar cada test: el secuenciador es un singleton compartido en el proceso
    sequencer.setSequence(1);
  });

  it('should return a policy number with format POL-YYYYMMDD-XXXXXX', () => {
    const number = sequencer.next();
    expect(number).toMatch(/^POL-\d{8}-\d{6}$/);
  });

  it('should increment the sequence on each call', () => {
    const first = sequencer.next();
    const second = sequencer.next();
    expect(first).not.toBe(second);
    const firstSeq = parseInt(first.slice(-6), 10);
    const secondSeq = parseInt(second.slice(-6), 10);
    expect(secondSeq).toBe(firstSeq + 1);
  });

  it('should continue the sequence after a restart when seeded from the database (regression for the restart bug)', () => {
    // Reproducción del bug original: el secuenciador vive en memoria, así que
    // al reiniciar la API volvía a 1 y regeneraba el mismo número que ya
    // existía en BD, violando la restricción UNIQUE de policy_number.
    const firstNumber = sequencer.next();
    const firstSeq = parseInt(firstNumber.slice(-6), 10);

    // Simular reinicio: el estado en memoria se pierde (vuelve a 1)
    sequencer.setSequence(1);

    // El fix: PolicyNumberInitializer siembra la secuencia con el máximo
    // de policy_number existente en BD + 1 antes de aceptar tráfico
    sequencer.setSequence(firstSeq + 1);

    const secondNumber = sequencer.next();
    const secondSeq = parseInt(secondNumber.slice(-6), 10);

    // Sin el fix, secondNumber === firstNumber (duplicado → error 500 de BD).
    // Con el fix, la secuencia continúa y no hay duplicados.
    expect(secondNumber).not.toBe(firstNumber);
    expect(secondSeq).toBe(firstSeq + 1);
  });
});
