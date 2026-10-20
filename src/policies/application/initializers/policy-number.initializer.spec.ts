import { PolicyNumberInitializer } from './policy-number.initializer';
import { PolicyNumberSequencer } from '../../../shared/singletons/policy-number-sequencer';
import { PolicyModel } from '../../domain/models/policy.model';

describe('PolicyNumberInitializer', () => {
  const sequencer = PolicyNumberSequencer.getInstance();

  const createPolicyWithNumber = (policyNumber: string): PolicyModel =>
    ({
      getPolicyNumber: () => policyNumber,
    }) as unknown as PolicyModel;

  const createInitializer = (policies: PolicyModel[]) => {
    const mockRepository: any = {
      findAll: jest.fn().mockResolvedValue(policies),
    };

    return new PolicyNumberInitializer(mockRepository);
  };

  beforeEach(() => {
    // Aislar cada test: el secuenciador es un singleton compartido en el proceso
    sequencer.setSequence(1);
  });

  it('should keep the sequence at 1 when the database is empty', async () => {
    const initializer = createInitializer([]);

    await initializer.onModuleInit();

    const number = sequencer.next();
    expect(number).toMatch(/^POL-\d{8}-000001$/);
  });

  it('should seed the sequence from the highest existing policy number', async () => {
    const initializer = createInitializer([
      createPolicyWithNumber('POL-20260101-000042'),
      createPolicyWithNumber('POL-20260101-000010'),
      createPolicyWithNumber('POL-20260101-000007'),
    ]);

    await initializer.onModuleInit();

    // El siguiente número disponible es el máximo (42) + 1
    const number = sequencer.next();
    expect(number).toMatch(/^POL-\d{8}-000043$/);
  });

  it('should continue the sequence when restarting the API on the same day (bug fix)', async () => {
    // Simular que antes del reinicio la API ya había generado estas pólizas
    const initializer = createInitializer([
      createPolicyWithNumber('POL-20261020-000001'),
      createPolicyWithNumber('POL-20261020-000002'),
    ]);

    await initializer.onModuleInit();

    // Tras el "reinicio" el secuenciador continúa en 3, no vuelve a 1
    const firstAfterRestart = sequencer.next();
    const secondAfterRestart = sequencer.next();

    expect(firstAfterRestart).toMatch(/^POL-\d{8}-000003$/);
    expect(secondAfterRestart).toMatch(/^POL-\d{8}-000004$/);
    expect(firstAfterRestart).not.toBe(secondAfterRestart);
  });

  it('should use the global maximum regardless of the date prefix', async () => {
    // El initializer toma el máximo de secuencia sin importar el día:
    // aunque el formato incluya fecha, la continuidad evita duplicados.
    const initializer = createInitializer([
      createPolicyWithNumber('POL-20260101-000100'),
      createPolicyWithNumber('POL-20261020-000050'),
    ]);

    await initializer.onModuleInit();

    const number = sequencer.next();
    expect(number).toMatch(/^POL-\d{8}-000101$/);
  });
});
