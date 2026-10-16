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
    const firstSeq = parseInt(first.slice(-6), 10);
    const secondSeq = parseInt(second.slice(-6), 10);
    expect(secondSeq).toBe(firstSeq + 1);
  });

  it('BUG REPRODUCTION: should generate duplicate policy number after restart (same day)', () => {
    // Resetear el secuenciador para aislar esta prueba de otras que lo usaron
    (sequencer as any).sequence = 1;

    // Simular que la aplicación ya generó un número hoy (antes del reinicio)
    const firstNumber = sequencer.next();
    const firstSeq = parseInt(firstNumber.slice(-6), 10);

    // Simular reinicio de la aplicación: el secuenciador vuelve a sequence = 1
    // como es un singleton en memoria, el estado se pierde al reiniciar el proceso
    (sequencer as any).sequence = 1;

    // Generar otro número el mismo día: debería ser diferente, pero es el mismo
    const secondNumber = sequencer.next();
    const secondSeq = parseInt(secondNumber.slice(-6), 10);

    // AMBOS números son iguales: POL-YYYYMMDD-000001
    expect(firstNumber).toBe(secondNumber);
    expect(firstSeq).toBe(secondSeq);
    // Esto demuestra el bug: al reiniciar la API el mismo día, se genera
    // un policy_number duplicado que choca con la restricción UNIQUE de BD
  });
});
