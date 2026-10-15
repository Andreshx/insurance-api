import { PolicyStatus } from '../../domain/models/policy-status.enum';
import { InvalidStateTransitionException } from '../../domain/exceptions/invalid-state-transition.exception';
import { ChangePolicyStatusDto } from '../dtos/change-policy-status.dto';
import { ChangePolicyStatusUseCase } from './change-policy-status.use-case';

describe('ChangePolicyStatusUseCase', () => {
  const mockRepository: any = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockPublisher: any = {
    publish: jest.fn(),
  };

  const useCase = new ChangePolicyStatusUseCase(mockRepository, mockPublisher);

  const invalidTransition = (current: PolicyStatus, target: PolicyStatus) => {
    throw new InvalidStateTransitionException(current, target);
  };

  const mockPolicy = (status: PolicyStatus): any => {
    const transitions: Record<PolicyStatus, any> = {
      [PolicyStatus.QUOTED]: {
        issue: () => mockPolicy(PolicyStatus.ISSUED),
        activate: () => invalidTransition(status, PolicyStatus.ACTIVE),
        suspend: () => invalidTransition(status, PolicyStatus.SUSPENDED),
        cancel: () => mockPolicy(PolicyStatus.CANCELLED),
      },
      [PolicyStatus.ISSUED]: {
        issue: () => mockPolicy(PolicyStatus.ISSUED),
        activate: () => mockPolicy(PolicyStatus.ACTIVE),
        suspend: () => invalidTransition(status, PolicyStatus.SUSPENDED),
        cancel: () => mockPolicy(PolicyStatus.CANCELLED),
      },
      [PolicyStatus.ACTIVE]: {
        issue: () => invalidTransition(status, PolicyStatus.ISSUED),
        activate: () => mockPolicy(PolicyStatus.ACTIVE),
        suspend: () => mockPolicy(PolicyStatus.SUSPENDED),
        cancel: () => mockPolicy(PolicyStatus.CANCELLED),
      },
      [PolicyStatus.SUSPENDED]: {
        issue: () => invalidTransition(status, PolicyStatus.ISSUED),
        activate: () => mockPolicy(PolicyStatus.ACTIVE),
        suspend: () => mockPolicy(PolicyStatus.SUSPENDED),
        cancel: () => mockPolicy(PolicyStatus.CANCELLED),
      },
      [PolicyStatus.CANCELLED]: {
        issue: () => invalidTransition(status, PolicyStatus.ISSUED),
        activate: () => invalidTransition(status, PolicyStatus.ACTIVE),
        suspend: () => invalidTransition(status, PolicyStatus.SUSPENDED),
        cancel: () => mockPolicy(PolicyStatus.CANCELLED),
      },
    };

    const t = transitions[status];
    return {
      getCurrentState: () => ({ status }),
      getId: () => 'policy-1',
      getPolicyNumber: () => 'POL-20260101-000001',
      getCustomerId: () => 'customer-1',
      getBranch: () => 'AUTO',
      ...t,
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return policy unchanged when target status equals current status', async () => {
    const policy = mockPolicy(PolicyStatus.ISSUED);
    mockRepository.findById.mockResolvedValue(policy);

    const dto: ChangePolicyStatusDto = { targetStatus: PolicyStatus.ISSUED };

    const result = await useCase.execute('policy-1', dto);

    expect(result).toBe(policy);
    expect(mockPublisher.publish).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should transition QUOTED -> ISSUED and publish policy.issued', async () => {
    const policy = mockPolicy(PolicyStatus.QUOTED);
    const issued = mockPolicy(PolicyStatus.ISSUED);
    mockRepository.findById.mockResolvedValue(policy);
    mockRepository.save.mockResolvedValue(issued);

    const dto: ChangePolicyStatusDto = { targetStatus: PolicyStatus.ISSUED };

    const result = await useCase.execute('policy-1', dto);

    expect(result).toBe(issued);
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Object));
    expect(mockPublisher.publish).toHaveBeenCalledWith(
      'policy.issued',
      expect.any(Object),
    );
  });

  it('should transition ISSUED -> ACTIVE and publish policy.activated', async () => {
    const policy = mockPolicy(PolicyStatus.ISSUED);
    const active = mockPolicy(PolicyStatus.ACTIVE);
    mockRepository.findById.mockResolvedValue(policy);
    mockRepository.save.mockResolvedValue(active);

    const dto: ChangePolicyStatusDto = { targetStatus: PolicyStatus.ACTIVE };

    await useCase.execute('policy-1', dto);

    expect(mockPublisher.publish).toHaveBeenCalledWith(
      'policy.activated',
      expect.any(Object),
    );
  });

  it('should transition ACTIVE -> SUSPENDED and publish policy.suspended', async () => {
    const policy = mockPolicy(PolicyStatus.ACTIVE);
    const suspended = mockPolicy(PolicyStatus.SUSPENDED);
    mockRepository.findById.mockResolvedValue(policy);
    mockRepository.save.mockResolvedValue(suspended);

    const dto: ChangePolicyStatusDto = { targetStatus: PolicyStatus.SUSPENDED };

    await useCase.execute('policy-1', dto);

    expect(mockPublisher.publish).toHaveBeenCalledWith(
      'policy.suspended',
      expect.any(Object),
    );
  });

  it('should transition SUSPENDED -> ACTIVE and publish policy.reactivated', async () => {
    const policy = mockPolicy(PolicyStatus.SUSPENDED);
    const active = mockPolicy(PolicyStatus.ACTIVE);
    mockRepository.findById.mockResolvedValue(policy);
    mockRepository.save.mockResolvedValue(active);

    const dto: ChangePolicyStatusDto = { targetStatus: PolicyStatus.ACTIVE };

    await useCase.execute('policy-1', dto);

    expect(mockPublisher.publish).toHaveBeenCalledWith(
      'policy.reactivated',
      expect.any(Object),
    );
  });

  it('should transition QUOTED -> CANCELLED and publish policy.cancelled', async () => {
    const policy = mockPolicy(PolicyStatus.QUOTED);
    const cancelled = mockPolicy(PolicyStatus.CANCELLED);
    mockRepository.findById.mockResolvedValue(policy);
    mockRepository.save.mockResolvedValue(cancelled);

    const dto: ChangePolicyStatusDto = { targetStatus: PolicyStatus.CANCELLED };

    await useCase.execute('policy-1', dto);

    expect(mockPublisher.publish).toHaveBeenCalledWith(
      'policy.cancelled',
      expect.any(Object),
    );
  });

  it('should throw InvalidStateTransitionException for invalid transitions', async () => {
    const policy = mockPolicy(PolicyStatus.QUOTED);
    mockRepository.findById.mockResolvedValue(policy);

    const dto: ChangePolicyStatusDto = { targetStatus: PolicyStatus.ACTIVE };

    await expect(useCase.execute('policy-1', dto)).rejects.toThrow(
      InvalidStateTransitionException,
    );
    expect(mockPublisher.publish).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw PolicyNotFoundException when policy does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const dto: ChangePolicyStatusDto = { targetStatus: PolicyStatus.ISSUED };

    await expect(useCase.execute('unknown', dto)).rejects.toThrow();
  });
});
