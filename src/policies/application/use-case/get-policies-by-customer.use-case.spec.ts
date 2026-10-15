import { GetPoliciesByCustomerUseCase } from './get-policies-by-customer.use-case';

describe('GetPoliciesByCustomerUseCase', () => {
  const mockRepository: any = {
    findByCustomerId: jest.fn(),
  };

  const useCase = new GetPoliciesByCustomerUseCase(mockRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty list when customer has no policies', async () => {
    mockRepository.findByCustomerId.mockResolvedValue([]);

    const result = await useCase.execute('customer-1');

    expect(mockRepository.findByCustomerId).toHaveBeenCalledWith('customer-1');
    expect(result).toEqual([]);
  });

  it('should return the list of policies for the customer', async () => {
    const policies = [{}, {}];
    mockRepository.findByCustomerId.mockResolvedValue(policies);

    const result = await useCase.execute('customer-1');

    expect(result).toHaveLength(2);
    expect(result).toBe(policies);
  });
});
