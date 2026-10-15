import { PolicyNotFoundException } from '../../domain/exceptions/policy-not-found.exception';
import { GetPolicyByIdUseCase } from './get-policy-by-id.use-case';

describe('GetPolicyByIdUseCase', () => {
  const mockRepository: any = {
    findById: jest.fn(),
  };

  const useCase = new GetPolicyByIdUseCase(mockRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the policy when found', async () => {
    const policy = { id: 'policy-1' };
    mockRepository.findById.mockResolvedValue(policy);

    const result = await useCase.execute('policy-1');

    expect(mockRepository.findById).toHaveBeenCalledWith('policy-1');
    expect(result).toBe(policy);
  });

  it('should throw PolicyNotFoundException when not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toThrow(
      PolicyNotFoundException,
    );
  });
});
